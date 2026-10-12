import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { customSwaggerCss } from "./swagger-theme.js";

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Squizme API Reference",
        description: "Minimal and modular Fastify backend services for quiz generation, attempts, and PostgreSQL storage.",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:6001",
          description: "Local development server",
        },
      ],
      tags: [
        { name: "System", description: "Health and diagnostic endpoints" },
        { name: "Generator", description: "AI quiz generation and prompt ingestion" },
        { name: "Quizzes", description: "Quiz management and questions" },
        { name: "Attempts", description: "Quiz attempt submissions and results" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs/swagger",
    theme: {
      title: "Squizme API Documentation",
      css: [
        {
          filename: "theme.css",
          content: customSwaggerCss,
        },
      ],
    },
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      filter: true,
      displayRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: "obsidian",
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}
