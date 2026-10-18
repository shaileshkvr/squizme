import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { DEV_DEFAULT_USER_ID, registerAuth } from "../../src/plugins/auth.js";
import {
  GenerationRequestSchema,
  TopicPlanSchema,
  JobStatusResponseSchema,
} from "@squizme/shared";

describe("Auth Plugin & Shared Contracts", () => {
  it("decorates request with default userId when x-user-id header is absent", async () => {
    const app = Fastify();
    await registerAuth(app);

    app.get("/test-auth", async (request) => {
      return { userId: request.userId };
    });

    const res = await app.inject({
      method: "GET",
      url: "/test-auth",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.userId).toBe(DEV_DEFAULT_USER_ID);
  });

  it("extracts custom userId when x-user-id header is provided", async () => {
    const app = Fastify();
    await registerAuth(app);

    app.get("/test-auth", async (request) => {
      return { userId: request.userId };
    });

    const customId = "123e4567-e89b-12d3-a456-426614174000";
    const res = await app.inject({
      method: "GET",
      url: "/test-auth",
      headers: {
        "x-user-id": customId,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.userId).toBe(customId);
  });

  it("validates GenerationRequestSchema successfully", () => {
    const valid = {
      idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
      prompt: "Create a quiz about photosynthesis",
      mode: "learning",
      difficulty: "medium",
      questionCount: 15,
    };
    const parsed = GenerationRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("validates TopicPlanSchema successfully", () => {
    const valid = {
      topics: [
        { name: "Light Reactions", questionCount: 8 },
        { name: "Calvin Cycle", questionCount: 7 },
      ],
      totalQuestionCount: 15,
    };
    const parsed = TopicPlanSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("validates JobStatusResponseSchema successfully", () => {
    const valid = {
      jobId: "123e4567-e89b-12d3-a456-426614174000",
      status: "generating",
      plannedQuestionCount: 15,
      acceptedQuestionCount: 8,
      completedBatches: 1,
      totalBatches: 2,
      quizId: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const parsed = JobStatusResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
