import { GeneratePromptSchema } from "@squizme/shared";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { isGroqConfigured } from "./groq.js";

export const generatorRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post(
    "/generator/prompt",
    {
      schema: {
        tags: ["Generator"],
        summary: "Receive and verify quiz generation prompt",
        description: "Accepts prompt text from the client textarea, checks Groq SDK readiness, and confirms payload receipt",
        body: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 1 },
            apiKey: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              receivedPrompt: { type: "string" },
              promptLength: { type: "number" },
              groqConfigured: { type: "boolean" },
              timestamp: { type: "string" },
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
      const parseResult = GeneratePromptSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.badRequest(parseResult.error.errors[0]?.message || "Invalid prompt data");
      }

      const { prompt, apiKey } = parseResult.data;
      const groqReady = isGroqConfigured(apiKey);

      return reply.send({
        success: true,
        message: "Prompt received successfully by backend",
        receivedPrompt: prompt,
        promptLength: prompt.length,
        groqConfigured: groqReady,
        timestamp: new Date().toISOString(),
      });
    }
  );
};
