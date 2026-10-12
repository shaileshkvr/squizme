import { SubmitAttemptSchema } from "@squizme/shared";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { getAttemptById, submitAttempt } from "./service.js";

export const attemptRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    "/attempts",
    {
      schema: {
        tags: ["Attempts"],
        summary: "Submit a quiz attempt",
        description: "Evaluates submitted answers, calculates score, and stores the attempt record",
        body: {
          type: "object",
          required: ["quizId", "answers"],
          properties: {
            quizId: { type: "string", format: "uuid" },
            participantName: { type: "string" },
            answers: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["questionId", "selectedOptionId"],
                properties: {
                  questionId: { type: "string" },
                  selectedOptionId: { type: "string" },
                },
              },
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              quizId: { type: "string" },
              participantName: { type: "string" },
              score: { type: "number" },
              totalQuestions: { type: "number" },
              percentage: { type: "number" },
              details: { type: "array" },
              completedAt: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const parseResult = SubmitAttemptSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.badRequest(parseResult.error.message);
      }

      const result = await submitAttempt(parseResult.data);
      if (!result) {
        return reply.notFound(`Quiz with ID ${parseResult.data.quizId} not found`);
      }

      return reply.status(201).send(result);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/attempts/:id",
    {
      schema: {
        tags: ["Attempts"],
        summary: "Get attempt result by ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              quizId: { type: "string" },
              participantName: { type: "string" },
              score: { type: "number" },
              totalQuestions: { type: "number" },
              percentage: { type: "number" },
              details: { type: "array" },
              completedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const attempt = await getAttemptById(id);
      if (!attempt) {
        return reply.notFound(`Attempt with ID ${id} not found`);
      }
      return reply.send(attempt);
    }
  );
};
