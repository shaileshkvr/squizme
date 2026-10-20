import type { Pool, PoolClient } from "pg";
import type {
  GenerationJobStatus,
  GenerationRequest,
  TopicPlan,
} from "@squizme/shared";
import type { PlannedBatch } from "../planning/batch-planner.js";
import type { ValidatedQuestion } from "../validation/validate-batch.js";
import { createHash } from "node:crypto";

export interface GenerationJobRow {
  id: string;
  user_id: string;
  idempotency_key: string;
  request_hash: string;
  status: GenerationJobStatus;
  request_snapshot: GenerationRequest;
  source_id: string | null;
  quiz_id: string | null;
  planned_question_count: number;
  accepted_question_count: number;
  completed_batch_count: number;
  total_batch_count: number;
  plan: TopicPlan | null;
  last_error_code: string | null;
  attempt_count: number;
  lease_owner: string | null;
  lease_expires_at: Date | null;
  heartbeat_at: Date | null;
  cancel_requested_at: Date | null;
  created_at: Date;
  updated_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
}

export function computeRequestHash(input: {
  prompt: string;
  sourceId?: string;
  mode: string;
  difficulty: string;
  questionCount: number;
}): string {
  const canonical = JSON.stringify({
    difficulty: input.difficulty,
    mode: input.mode,
    prompt: input.prompt.trim(),
    questionCount: input.questionCount,
    sourceId: input.sourceId ?? null,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export async function createGenerationJob(
  pool: Pool,
  userId: string,
  request: GenerationRequest
): Promise<{ job: GenerationJobRow; isNew: boolean }> {
  const reqHash = computeRequestHash({
    prompt: request.prompt,
    sourceId: request.sourceId,
    mode: request.mode,
    difficulty: request.difficulty,
    questionCount: request.questionCount,
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check idempotency match
    const existing = await client.query<GenerationJobRow>(
      "SELECT * FROM generation_jobs WHERE user_id = $1 AND idempotency_key = $2 FOR UPDATE;",
      [userId, request.idempotencyKey]
    );

    if (existing.rows.length > 0) {
      const existingJob = existing.rows[0];
      await client.query("COMMIT");
      if (existingJob.request_hash !== reqHash) {
        throw new Error(
          "IDEMPOTENCY_KEY_REUSED: Idempotency key was previously used with a different request payload"
        );
      }
      return { job: existingJob, isNew: false };
    }

    // Check active job constraint
    const active = await client.query<GenerationJobRow>(
      `SELECT * FROM generation_jobs 
       WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled', 'failed') 
       LIMIT 1;`,
      [userId]
    );

    if (active.rows.length > 0) {
      await client.query("ROLLBACK");
      throw new Error(
        "ACTIVE_GENERATION_EXISTS: An active generation job is already in progress for this user"
      );
    }

    // Insert new job
    const insertResult = await client.query<GenerationJobRow>(
      `INSERT INTO generation_jobs (
        user_id, idempotency_key, request_hash, status, request_snapshot,
        source_id, planned_question_count
      ) VALUES ($1, $2, $3, 'queued', $4::jsonb, $5, $6)
      RETURNING *;`,
      [
        userId,
        request.idempotencyKey,
        reqHash,
        JSON.stringify(request),
        request.sourceId || null,
        request.questionCount,
      ]
    );

    await client.query("COMMIT");
    return { job: insertResult.rows[0], isNew: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function claimNextJob(
  pool: Pool,
  workerId: string,
  leaseDurationMs: number
): Promise<GenerationJobRow | null> {
  const query = `
    WITH next_job AS (
      SELECT id FROM generation_jobs
      WHERE status = 'queued'
         OR (status IN ('planning', 'generating', 'finalizing') AND lease_expires_at < NOW())
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE generation_jobs
    SET status = CASE WHEN generation_jobs.status = 'queued' THEN 'planning'::generation_job_status ELSE generation_jobs.status END,
        lease_owner = $1,
        lease_expires_at = NOW() + ($2 || ' milliseconds')::interval,
        heartbeat_at = NOW(),
        attempt_count = attempt_count + 1,
        started_at = COALESCE(started_at, NOW()),
        updated_at = NOW()
    FROM next_job
    WHERE generation_jobs.id = next_job.id
    RETURNING generation_jobs.*;
  `;

  const result = await pool.query<GenerationJobRow>(query, [
    workerId,
    leaseDurationMs,
  ]);
  return result.rows[0] || null;
}

export async function updateHeartbeat(
  pool: Pool,
  jobId: string,
  workerId: string,
  leaseDurationMs: number
): Promise<{ ok: boolean; cancelRequested: boolean }> {
  const query = `
    UPDATE generation_jobs
    SET heartbeat_at = NOW(),
        lease_expires_at = NOW() + ($3 || ' milliseconds')::interval,
        updated_at = NOW()
    WHERE id = $1 AND lease_owner = $2
    RETURNING status, cancel_requested_at;
  `;

  const result = await pool.query<{
    status: GenerationJobStatus;
    cancel_requested_at: Date | null;
  }>(query, [jobId, workerId, leaseDurationMs]);

  if (result.rows.length === 0) {
    return { ok: false, cancelRequested: false };
  }

  const row = result.rows[0];
  const cancelRequested =
    row.status === "cancel_requested" || row.cancel_requested_at !== null;

  return { ok: true, cancelRequested };
}

export async function saveTopicPlanAndBatches(
  pool: Pool,
  jobId: string,
  workerId: string,
  plan: TopicPlan,
  batches: PlannedBatch[]
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify lease and transition to 'generating'
    const updateJob = await client.query(
      `UPDATE generation_jobs
       SET plan = $3::jsonb,
           total_batch_count = $4,
           status = 'generating',
           updated_at = NOW()
       WHERE id = $1 AND lease_owner = $2 AND status = 'planning'
       RETURNING id;`,
      [jobId, workerId, JSON.stringify(plan), batches.length]
    );

    if (updateJob.rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    // Insert planned batch rows
    for (const b of batches) {
      await client.query(
        `INSERT INTO generation_job_batches (
          job_id, batch_number, status, planned_question_count, topic_allocation
        ) VALUES ($1, $2, 'pending', $3, $4::jsonb)
        ON CONFLICT (job_id, batch_number) DO NOTHING;`,
        [jobId, b.batchNumber, b.plannedQuestionCount, JSON.stringify(b.topicAllocation)]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export async function commitBatchTransaction(
  pool: Pool,
  params: {
    jobId: string;
    workerId: string;
    batchNumber: number;
    acceptedQuestions: ValidatedQuestion[];
    allAccumulatedQuestions: ValidatedQuestion[];
    isFinalBatch: boolean;
    quizTitle: string;
    quizDescription?: string;
  }
): Promise<{ ok: boolean; quizId?: string }> {
  const {
    jobId,
    workerId,
    batchNumber,
    acceptedQuestions,
    allAccumulatedQuestions,
    isFinalBatch,
    quizTitle,
    quizDescription,
  } = params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Verify worker still owns lease and cancellation hasn't won
    const checkJob = await client.query<{ status: GenerationJobStatus }>(
      `SELECT status FROM generation_jobs 
       WHERE id = $1 AND lease_owner = $2 FOR UPDATE;`,
      [jobId, workerId]
    );

    if (
      checkJob.rows.length === 0 ||
      checkJob.rows[0].status === "cancelled" ||
      checkJob.rows[0].status === "cancel_requested"
    ) {
      await client.query("ROLLBACK");
      return { ok: false };
    }

    // 2. Mark batch completed
    await client.query(
      `UPDATE generation_job_batches
       SET status = 'completed',
           accepted_question_count = $3,
           completed_at = NOW()
       WHERE job_id = $1 AND batch_number = $2;`,
      [jobId, batchNumber, acceptedQuestions.length]
    );

    let createdQuizId: string | undefined;

    // 3. If final batch, create quiz and complete job
    if (isFinalBatch) {
      // Shuffle questions across all accumulated batches so topics and difficulty are interleaved
      const shuffledQuestions = shuffleArray(allAccumulatedQuestions);

      // Map questions to standard schema structure with generated IDs and randomized options
      const mappedQuestions = shuffledQuestions.map((q, qIdx) => {
        const shuffledOptions = shuffleArray(q.options);
        return {
          id: `q-${qIdx + 1}`,
          prompt: q.prompt,
          topic: q.topic,
          explanation: q.explanation,
          options: shuffledOptions.map((opt, oIdx) => ({
            id: `opt-${qIdx + 1}-${oIdx + 1}`,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        };
      });

      const quizInsert = await client.query<{ id: string }>(
        `INSERT INTO quizzes (title, description, questions)
         VALUES ($1, $2, $3::jsonb)
         RETURNING id;`,
        [quizTitle, quizDescription || null, JSON.stringify(mappedQuestions)]
      );
      createdQuizId = quizInsert.rows[0].id;

      await client.query(
        `UPDATE generation_jobs
         SET status = 'completed',
             quiz_id = $3,
             completed_batch_count = completed_batch_count + 1,
             accepted_question_count = accepted_question_count + $4,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND lease_owner = $2;`,
        [jobId, workerId, createdQuizId, acceptedQuestions.length]
      );
    } else {
      // Intermediate batch commit
      await client.query(
        `UPDATE generation_jobs
         SET completed_batch_count = completed_batch_count + 1,
             accepted_question_count = accepted_question_count + $3,
             updated_at = NOW()
         WHERE id = $1 AND lease_owner = $2;`,
        [jobId, workerId, acceptedQuestions.length]
      );
    }

    await client.query("COMMIT");
    return { ok: true, quizId: createdQuizId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function requestJobCancellation(
  pool: Pool,
  jobId: string,
  userId: string
): Promise<{ success: boolean; currentStatus: GenerationJobStatus }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query<{ status: GenerationJobStatus }>(
      `SELECT status FROM generation_jobs 
       WHERE id = $1 AND user_id = $2 FOR UPDATE;`,
      [jobId, userId]
    );

    if (res.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("GENERATION_NOT_FOUND: Job not found or not owned by user");
    }

    const currentStatus = res.rows[0].status;

    // Terminal states cannot be cancelled
    if (["completed", "cancelled", "failed"].includes(currentStatus)) {
      await client.query("COMMIT");
      return { success: false, currentStatus };
    }

    // Transition to cancel_requested
    await client.query(
      `UPDATE generation_jobs
       SET status = 'cancel_requested',
           cancel_requested_at = NOW(),
           updated_at = NOW()
       WHERE id = $1;`,
      [jobId]
    );

    await client.query("COMMIT");
    return { success: true, currentStatus: "cancel_requested" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function finalizeJobCancellation(
  pool: Pool,
  jobId: string,
  workerId: string
): Promise<void> {
  await pool.query(
    `UPDATE generation_jobs
     SET status = 'cancelled',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1 AND (lease_owner = $2 OR lease_owner IS NULL);`,
    [jobId, workerId]
  );
}

export async function failJob(
  pool: Pool,
  jobId: string,
  errorCode: string
): Promise<void> {
  await pool.query(
    `UPDATE generation_jobs
     SET status = 'failed',
         last_error_code = $2,
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1;`,
    [jobId, errorCode]
  );
}

export async function getJobById(
  pool: Pool,
  jobId: string,
  userId?: string
): Promise<GenerationJobRow | null> {
  const query = userId
    ? "SELECT * FROM generation_jobs WHERE id = $1 AND user_id = $2;"
    : "SELECT * FROM generation_jobs WHERE id = $1;";
  const params = userId ? [jobId, userId] : [jobId];

  const result = await pool.query<GenerationJobRow>(query, params);
  return result.rows[0] || null;
}

export async function findActiveJobByUserId(
  pool: Pool,
  userId: string
): Promise<GenerationJobRow | null> {
  const result = await pool.query<GenerationJobRow>(
    `SELECT * FROM generation_jobs 
     WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled', 'failed')
     ORDER BY created_at DESC
     LIMIT 1;`,
    [userId]
  );
  return result.rows[0] || null;
}
