import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { pool, closeDb } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrator.js";

describe("Quiz Generation API Endpoints", () => {
  let app: FastifyInstance;
  const testUserId = "77777777-7777-7777-7777-777777777777";

  beforeAll(async () => {
    await runMigrations(pool);
    app = await buildApp();
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM generation_jobs;");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM generation_jobs;");
    await app.close();
    await closeDb();
  });

  it("submits a generation job with 202 Accepted and handles idempotency & active constraints", async () => {
    const idempotencyKey = "88888888-8888-8888-8888-888888888888";

    // 1. Valid submission
    const res1 = await app.inject({
      method: "POST",
      url: "/api/quiz-generations",
      headers: { "x-user-id": testUserId },
      payload: {
        idempotencyKey,
        prompt: "General Relativity and Gravity",
        mode: "assessment",
        difficulty: "hard",
        questionCount: 10,
      },
    });

    expect(res1.statusCode).toBe(202);
    const body1 = JSON.parse(res1.body);
    expect(body1.jobId).toBeDefined();
    expect(body1.status).toBe("queued");
    expect(body1.plannedQuestionCount).toBe(10);

    // 2. Exact idempotency replay returns 202 with same jobId
    const res2 = await app.inject({
      method: "POST",
      url: "/api/quiz-generations",
      headers: { "x-user-id": testUserId },
      payload: {
        idempotencyKey,
        prompt: "General Relativity and Gravity",
        mode: "assessment",
        difficulty: "hard",
        questionCount: 10,
      },
    });

    expect(res2.statusCode).toBe(202);
    const body2 = JSON.parse(res2.body);
    expect(body2.jobId).toBe(body1.jobId);

    // 3. Reusing idempotency key with different payload returns 409
    const res3 = await app.inject({
      method: "POST",
      url: "/api/quiz-generations",
      headers: { "x-user-id": testUserId },
      payload: {
        idempotencyKey,
        prompt: "Special Relativity instead",
        mode: "assessment",
        difficulty: "hard",
        questionCount: 10,
      },
    });

    expect(res3.statusCode).toBe(409);
    expect(JSON.parse(res3.body).error).toBe("IDEMPOTENCY_KEY_REUSED");

    // 4. Submitting a new job while an active job exists returns 409 ACTIVE_GENERATION_EXISTS
    const res4 = await app.inject({
      method: "POST",
      url: "/api/quiz-generations",
      headers: { "x-user-id": testUserId },
      payload: {
        idempotencyKey: "99999999-9999-9999-9999-999999999999",
        prompt: "Black Holes and Singularity",
        mode: "learning",
        difficulty: "easy",
        questionCount: 5,
      },
    });

    expect(res4.statusCode).toBe(409);
    expect(JSON.parse(res4.body).error).toBe("ACTIVE_GENERATION_EXISTS");

    // 5. GET /api/quiz-generations/active returns the active job
    const activeRes = await app.inject({
      method: "GET",
      url: "/api/quiz-generations/active",
      headers: { "x-user-id": testUserId },
    });

    expect(activeRes.statusCode).toBe(200);
    expect(JSON.parse(activeRes.body).jobId).toBe(body1.jobId);

    // 6. GET /api/quiz-generations/:jobId returns the job by ID
    const getRes = await app.inject({
      method: "GET",
      url: `/api/quiz-generations/${body1.jobId}`,
      headers: { "x-user-id": testUserId },
    });

    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body).jobId).toBe(body1.jobId);

    // 7. POST /api/quiz-generations/:jobId/cancel transitions job to cancel_requested
    const cancelRes = await app.inject({
      method: "POST",
      url: `/api/quiz-generations/${body1.jobId}/cancel`,
      headers: { "x-user-id": testUserId },
    });

    expect(cancelRes.statusCode).toBe(200);
    expect(JSON.parse(cancelRes.body).success).toBe(true);
    expect(JSON.parse(cancelRes.body).status).toBe("cancel_requested");

    // Clean up
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [body1.jobId]);
  });

  it("returns critic error details when polling a failed job with TOPIC_REJECTED_GIBBERISH", async () => {
    const key = "99999999-9999-9999-9999-999999999999";
    const subRes = await app.inject({
      method: "POST",
      url: "/api/quiz-generations",
      headers: { "x-user-id": testUserId },
      payload: {
        idempotencyKey: key,
        prompt: "quantum banana database photosynthesis",
        mode: "learning",
        difficulty: "easy",
        questionCount: 5,
      },
    });

    const { jobId } = JSON.parse(subRes.body);

    // Simulate worker failing job due to rejection
    const criticMessage = "That doesn't look like a real topic.";
    await pool.query(
      `UPDATE generation_jobs
       SET status = 'failed',
           last_error_code = 'TOPIC_REJECTED',
           last_error_message = $2
       WHERE id = $1;`,
      [jobId, criticMessage]
    );

    const pollRes = await app.inject({
      method: "GET",
      url: `/api/quiz-generations/${jobId}`,
      headers: { "x-user-id": testUserId },
    });

    expect(pollRes.statusCode).toBe(200);
    const body = JSON.parse(pollRes.body);
    expect(body.status).toBe("failed");
    expect(body.error).not.toBeNull();
    expect(body.error.code).toBe("TOPIC_REJECTED");
    expect(body.error.message).toBe(criticMessage);

    // Clean up
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [jobId]);
  });
});
