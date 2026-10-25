import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { pool, closeDb } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrator.js";
import {
  createGenerationJob,
  claimNextJob,
  updateHeartbeat,
  saveTopicPlanAndBatches,
  commitBatchTransaction,
  requestJobCancellation,
  finalizeJobCancellation,
  getJobById,
  failJob,
} from "../../src/modules/generation/jobs/job.repository.js";
import type { GenerationRequest, TopicPlan } from "@squizme/shared";

describe("Job Repository Integration Tests", () => {
  beforeAll(async () => {
    await runMigrations(pool);
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM generation_jobs;");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM generation_jobs;");
    await closeDb();
  });

  const testUserId = "11111111-1111-1111-1111-111111111111";

  it("handles idempotent job submission and prevents active duplicates", async () => {
    const key = "22222222-2222-2222-2222-222222222222";
    const req: GenerationRequest = {
      idempotencyKey: key,
      prompt: "History of Ancient Rome",
      mode: "assessment",
      difficulty: "hard",
      questionCount: 10,
    };

    // 1. First submission - creates new job
    const { job: job1, isNew: isNew1 } = await createGenerationJob(pool, testUserId, req);
    expect(isNew1).toBe(true);
    expect(job1.status).toBe("queued");
    expect(job1.planned_question_count).toBe(10);

    // 2. Exact repeated submission with same key - returns existing job
    const { job: job2, isNew: isNew2 } = await createGenerationJob(pool, testUserId, req);
    expect(isNew2).toBe(false);
    expect(job2.id).toBe(job1.id);

    // 3. Repeated submission with different payload - throws conflict
    const differentReq: GenerationRequest = {
      ...req,
      prompt: "History of Greece instead",
    };
    await expect(
      createGenerationJob(pool, testUserId, differentReq)
    ).rejects.toThrow(/IDEMPOTENCY_KEY_REUSED/);

    // Clean up job to not block subsequent tests for testUserId
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [job1.id]);
  });

  it("claims jobs atomically with row locking (FOR UPDATE SKIP LOCKED) and prevents double claims", async () => {
    const key = "33333333-3333-3333-3333-333333333333";
    const req: GenerationRequest = {
      idempotencyKey: key,
      prompt: "Quantum Computing Basics",
      mode: "learning",
      difficulty: "medium",
      questionCount: 15,
    };

    const { job } = await createGenerationJob(pool, testUserId, req);

    // Worker 1 claims job
    const claimedByWorker1 = await claimNextJob(pool, "worker-node-1", 60000);
    expect(claimedByWorker1).not.toBeNull();
    expect(claimedByWorker1!.id).toBe(job.id);
    expect(claimedByWorker1!.lease_owner).toBe("worker-node-1");
    expect(claimedByWorker1!.status).toBe("planning");

    // Worker 2 attempts to claim - queue should be empty (job locked/active)
    const claimedByWorker2 = await claimNextJob(pool, "worker-node-2", 60000);
    expect(claimedByWorker2).toBeNull();

    // Heartbeat check
    const hb = await updateHeartbeat(pool, job.id, "worker-node-1", 60000);
    expect(hb.ok).toBe(true);
    expect(hb.cancelRequested).toBe(false);

    // Save topic plan and batches
    const plan: TopicPlan = {
      topics: [{ name: "Qubits", questionCount: 15 }],
      totalQuestionCount: 15,
    };
    const saved = await saveTopicPlanAndBatches(pool, job.id, "worker-node-1", plan, [
      {
        batchNumber: 1,
        plannedQuestionCount: 15,
        topicAllocation: [{ topicName: "Qubits", questionCount: 15 }],
      },
    ]);
    expect(saved).toBe(true);

    // Commit final batch transaction
    const commitResult = await commitBatchTransaction(pool, {
      jobId: job.id,
      workerId: "worker-node-1",
      batchNumber: 1,
      acceptedQuestions: [
        {
          prompt: "What is superposition?",
          topic: "Qubits",
          options: [
            { id: "A", text: "Linear combination of states", isCorrect: true },
            { id: "B", text: "Classical bit flipping", isCorrect: false },
          ],
        },
      ],
      allAccumulatedQuestions: [
        {
          prompt: "What is superposition?",
          topic: "Qubits",
          options: [
            { id: "A", text: "Linear combination of states", isCorrect: true },
            { id: "B", text: "Classical bit flipping", isCorrect: false },
          ],
        },
      ],
      isFinalBatch: true,
      quizTitle: "Quantum Computing Quiz",
    });

    expect(commitResult.ok).toBe(true);
    expect(commitResult.quizId).toBeDefined();

    // Verify job is marked completed and references quiz
    const updatedJob = await getJobById(pool, job.id);
    expect(updatedJob!.status).toBe("completed");
    expect(updatedJob!.quiz_id).toBe(commitResult.quizId);

    // Clean up
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [job.id]);
    await pool.query("DELETE FROM quizzes WHERE id = $1;", [commitResult.quizId]);
  });

  it("handles cooperative cancellation safely", async () => {
    const key = "44444444-4444-4444-4444-444444444444";
    const req: GenerationRequest = {
      idempotencyKey: key,
      prompt: "Astrophysics and Planetary Science",
      mode: "learning",
      difficulty: "hard",
      questionCount: 10,
    };

    const { job } = await createGenerationJob(pool, testUserId, req);
    await claimNextJob(pool, "worker-node-1", 60000);

    // Request cancellation
    const cancelResult = await requestJobCancellation(pool, job.id, testUserId);
    expect(cancelResult.success).toBe(true);
    expect(cancelResult.currentStatus).toBe("cancel_requested");

    // Worker checks heartbeat and observes cancelRequested = true
    const hb = await updateHeartbeat(pool, job.id, "worker-node-1", 60000);
    expect(hb.cancelRequested).toBe(true);

    // Worker acknowledges and finalizes cancellation
    await finalizeJobCancellation(pool, job.id, "worker-node-1");
    const cancelledJob = await getJobById(pool, job.id);
    expect(cancelledJob!.status).toBe("cancelled");

    // Clean up
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [job.id]);
  });

  it("persists error code and critic message when failJob is called", async () => {
    const key = "55555555-5555-5555-5555-555555555555";
    const req: GenerationRequest = {
      idempotencyKey: key,
      prompt: "asdfghjkl qwertyuiop nonsense",
      mode: "learning",
      difficulty: "easy",
      questionCount: 5,
    };

    const { job } = await createGenerationJob(pool, testUserId, req);
    await failJob(
      pool,
      job.id,
      "TOPIC_REJECTED",
      "That doesn't look like a real topic."
    );

    const failedJob = await getJobById(pool, job.id);
    expect(failedJob).not.toBeNull();
    expect(failedJob!.status).toBe("failed");
    expect(failedJob!.last_error_code).toBe("TOPIC_REJECTED");
    expect(failedJob!.last_error_message).toBe(
      "That doesn't look like a real topic."
    );
  });
});
