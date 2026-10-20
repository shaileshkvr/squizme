import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type Groq from "groq-sdk";
import { pool, closeDb } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrator.js";
import {
  createGenerationJob,
  getJobById,
} from "../../src/modules/generation/jobs/job.repository.js";
import { GenerationWorker } from "../../src/modules/generation/jobs/job.worker.js";
import * as groqClientModule from "../../src/modules/generation/integrations/groq-client.js";

describe("Generation Worker End-to-End Execution", () => {
  beforeAll(async () => {
    await runMigrations(pool);
    await pool.query("DELETE FROM generation_jobs;");
  });

  afterAll(async () => {
    await closeDb();
  });

  const testUserId = "55555555-5555-5555-5555-555555555555";

  it("processes a queued job to completion and creates a quiz", async () => {
    const key = "66666666-6666-6666-6666-666666666666";
    const { job } = await createGenerationJob(pool, testUserId, {
      idempotencyKey: key,
      prompt: "Renewable Energy and Solar Power",
      mode: "learning",
      difficulty: "easy",
      questionCount: 5,
    });

    // Mock Groq responses for both topic analysis and batch generation
    vi.spyOn(groqClientModule, "callGroqChat")
      // 1. Topic analysis call
      .mockResolvedValueOnce(
        JSON.stringify({
          topics: [
            { name: "Solar Power", questionCount: 3 },
            { name: "Wind Energy", questionCount: 2 },
          ],
        })
      )
      // 2. Batch generation call
      .mockResolvedValueOnce(
        JSON.stringify({
          questions: [
            {
              prompt: "Solar panels convert light via what effect?",
              topic: "Solar Power",
              options: [
                { text: "Photovoltaic effect", isCorrect: true },
                { text: "Thermoelectric effect", isCorrect: false },
              ],
            },
            {
              prompt: "What is the primary material in modern solar cells?",
              topic: "Solar Power",
              options: [
                { text: "Silicon", isCorrect: true },
                { text: "Copper", isCorrect: false },
              ],
            },
            {
              prompt: "Which parameter measures solar irradiance?",
              topic: "Solar Power",
              options: [
                { text: "Watts per square meter", isCorrect: true },
                { text: "Volts", isCorrect: false },
              ],
            },
            {
              prompt: "Wind turbines convert kinetic energy into?",
              topic: "Wind Energy",
              options: [
                { text: "Electrical energy", isCorrect: true },
                { text: "Chemical energy", isCorrect: false },
              ],
            },
            {
              prompt: "Betz limit defines maximum efficiency of wind extraction at approximately?",
              topic: "Wind Energy",
              options: [
                { text: "59.3%", isCorrect: true },
                { text: "99.9%", isCorrect: false },
              ],
            },
          ],
        })
      );

    const worker = new GenerationWorker(pool, "test-worker-e2e", {} as Groq);
    const didWork = await worker.runOnce();

    expect(didWork).toBe(true);

    const finishedJob = await getJobById(pool, job.id);
    expect(finishedJob!.status).toBe("completed");
    expect(finishedJob!.accepted_question_count).toBe(5);
    expect(finishedJob!.quiz_id).not.toBeNull();

    // Verify quiz in quizzes table
    const { rows: quizRows } = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1;",
      [finishedJob!.quiz_id]
    );
    expect(quizRows).toHaveLength(1);
    expect(quizRows[0].title).toContain("Renewable Energy");
    expect(quizRows[0].questions).toHaveLength(5);

    // Clean up
    await pool.query("DELETE FROM generation_jobs WHERE id = $1;", [job.id]);
    await pool.query("DELETE FROM quizzes WHERE id = $1;", [finishedJob!.quiz_id]);
  });
});
