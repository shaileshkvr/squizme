import type { Pool } from "pg";
import type Groq from "groq-sdk";
import { env } from "../../../config/env.js";
import { createGroqClient } from "../integrations/groq-client.js";
import { planBatches, type PlannedBatch } from "../planning/batch-planner.js";
import { analyzeTopicsAndPlan, TopicRejectionError } from "../planning/topic-analyzer.js";
import {
  generateBatchQuestions,
  type BatchGenerationContext,
} from "../question-generation/generate-batch.js";
import type { ValidatedQuestion } from "../validation/validate-batch.js";
import {
  claimNextJob,
  commitBatchTransaction,
  failJob,
  finalizeJobCancellation,
  getJobById,
  saveTopicPlanAndBatches,
  updateHeartbeat,
  type GenerationJobRow,
} from "./job.repository.js";

export class GenerationWorker {
  private isRunning = false;
  private currentJobCancelRequested = false;

  constructor(
    private pool: Pool,
    public readonly workerId = `worker-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
    private groqClient: Groq = createGroqClient()
  ) {}

  public async runOnce(): Promise<boolean> {
    const job = await claimNextJob(this.pool, this.workerId, env.LEASE_DURATION_MS);
    if (!job) {
      return false;
    }

    await this.processJob(job);
    return true;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    while (this.isRunning) {
      try {
        const didWork = await this.runOnce();
        if (!didWork && this.isRunning) {
          await new Promise((resolve) =>
            setTimeout(resolve, env.WORKER_POLL_INTERVAL_MS)
          );
        }
      } catch (err) {
        console.error(`[Worker ${this.workerId}] Error in loop:`, err);
        if (this.isRunning) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
  }

  public stop(): void {
    this.isRunning = false;
  }

  public async processJob(initialJob: GenerationJobRow): Promise<void> {
    const jobId = initialJob.id;
    this.currentJobCancelRequested = false;

    // Start background heartbeat
    const heartbeatTimer = setInterval(async () => {
      try {
        const hb = await updateHeartbeat(
          this.pool,
          jobId,
          this.workerId,
          env.LEASE_DURATION_MS
        );
        if (hb.cancelRequested) {
          this.currentJobCancelRequested = true;
        }
      } catch (err) {
        console.warn(`[Worker ${this.workerId}] Heartbeat update failed:`, err);
      }
    }, env.HEARTBEAT_INTERVAL_MS);

    try {
      let job = initialJob;

      // 1. Check for cancellation
      if (this.currentJobCancelRequested) {
        await finalizeJobCancellation(this.pool, jobId, this.workerId);
        return;
      }

      // 2. Planning phase (if not already planned)
      if (!job.plan) {
        const topicPlan = await analyzeTopicsAndPlan(
          job.request_snapshot.prompt,
          job.planned_question_count,
          job.request_snapshot.mode,
          job.request_snapshot.difficulty,
          this.groqClient
        );

        const batchPlan = planBatches({
          totalQuestions: job.planned_question_count,
          maxBatchSize: env.MAX_BATCH_SIZE,
          topics: topicPlan.topics,
        });

        const saved = await saveTopicPlanAndBatches(
          this.pool,
          jobId,
          this.workerId,
          topicPlan,
          batchPlan
        );

        if (!saved) {
          throw new Error("Failed to save topic plan: lease lost or job cancelled");
        }

        const reloaded = await getJobById(this.pool, jobId);
        if (!reloaded) throw new Error("Job disappeared after planning");
        job = reloaded;
      }

      // 3. Retrieve batches from generation_job_batches
      const { rows: batchRows } = await this.pool.query<{
        batch_number: number;
        status: string;
        planned_question_count: number;
        topic_allocation: Array<{ topicName: string; questionCount: number }>;
      }>(
        `SELECT batch_number, status, planned_question_count, topic_allocation 
         FROM generation_job_batches 
         WHERE job_id = $1 
         ORDER BY batch_number ASC;`,
        [jobId]
      );

      const allAccumulatedQuestions: ValidatedQuestion[] = [];

      // 4. Batch generation loop
      for (let i = 0; i < batchRows.length; i++) {
        const batch = batchRows[i];
        const isFinalBatch = i === batchRows.length - 1;

        // Cooperative cancellation check before starting batch
        if (this.currentJobCancelRequested) {
          await finalizeJobCancellation(this.pool, jobId, this.workerId);
          return;
        }

        // If batch was already completed (recovery scenario), skip generation
        if (batch.status === "completed") {
          continue;
        }

        const batchContext: BatchGenerationContext = {
          prompt: job.request_snapshot.prompt,
          mode: job.request_snapshot.mode,
          difficulty: job.request_snapshot.difficulty,
          batchNumber: batch.batch_number,
          plannedTopics: batch.topic_allocation,
          previousQuestionPrompts: allAccumulatedQuestions.map((q) => q.prompt),
        };

        const batchQuestions = await generateBatchQuestions(
          batchContext,
          this.groqClient
        );

        // Cancellation check right before committing
        if (this.currentJobCancelRequested) {
          await finalizeJobCancellation(this.pool, jobId, this.workerId);
          return;
        }

        allAccumulatedQuestions.push(...batchQuestions);

        const quizTitle = `${job.request_snapshot.prompt.slice(0, 40)} Quiz`;
        const commitResult = await commitBatchTransaction(this.pool, {
          jobId,
          workerId: this.workerId,
          batchNumber: batch.batch_number,
          acceptedQuestions: batchQuestions,
          allAccumulatedQuestions,
          isFinalBatch,
          quizTitle,
          quizDescription: `Generated ${job.request_snapshot.mode} quiz (${job.request_snapshot.difficulty}) on ${job.request_snapshot.prompt}`,
        });

        if (!commitResult.ok) {
          // Lease lost or cancelled concurrently
          return;
        }
      }
    } catch (err) {
      if (err instanceof TopicRejectionError) {
        console.warn(`[Worker ${this.workerId}] Job ${jobId} rejected during planning: ${err.message}`);
        await failJob(this.pool, jobId, err.code, err.message);
        return;
      }
      console.error(`[Worker ${this.workerId}] Job ${jobId} failed:`, err);
      await failJob(this.pool, jobId, "GENERATION_FAILED", err instanceof Error ? err.message : undefined);
    } finally {
      clearInterval(heartbeatTimer);
    }
  }
}
