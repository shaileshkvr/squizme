import { CreateQuizSchema } from "@squizme/shared";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  listQuizzes,
} from "./service.js";

export const quizRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get(
    "/quizzes",
    {
      schema: {
        tags: ["Quizzes"],
        summary: "List all quizzes",
        description: "Returns a list of all created quizzes with question counts",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                questionCount: { type: "number" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const quizzes = await listQuizzes();
      return reply.send(quizzes);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/quizzes/:id",
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Get quiz by ID",
        description: "Returns the complete quiz details including questions and options",
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
              title: { type: "string" },
              description: { type: "string" },
              questions: { type: "array" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
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
      const quiz = await getQuizById(id);
      if (!quiz) {
        return reply.notFound(`Quiz with ID ${id} not found`);
      }
      return reply.send(quiz);
    }
  );

  app.post(
    "/quizzes",
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Create a new quiz",
        description: "Validates and creates a quiz with questions and choices",
        body: {
          type: "object",
          required: ["title", "questions"],
          properties: {
            title: { type: "string", minLength: 3 },
            description: { type: "string" },
            questions: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["id", "prompt", "options"],
                properties: {
                  id: { type: "string" },
                  prompt: { type: "string" },
                  explanation: { type: "string" },
                  options: {
                    type: "array",
                    minItems: 2,
                    items: {
                      type: "object",
                      required: ["id", "text", "isCorrect"],
                      properties: {
                        id: { type: "string" },
                        text: { type: "string" },
                        isCorrect: { type: "boolean" },
                      },
                    },
                  },
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
              title: { type: "string" },
              description: { type: "string" },
              questions: { type: "array" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
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
        },
      },
    },
    async (request, reply) => {
      const parseResult = CreateQuizSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.badRequest(parseResult.error.message);
      }
      const created = await createQuiz(parseResult.data);
      return reply.status(201).send(created);
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/quizzes/:id",
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Delete a quiz by ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: {
            type: "null",
            description: "Quiz successfully deleted",
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
      const deleted = await deleteQuiz(id);
      if (!deleted) {
        return reply.notFound(`Quiz with ID ${id} not found`);
      }
      return reply.status(204).send();
    }
  );
};
