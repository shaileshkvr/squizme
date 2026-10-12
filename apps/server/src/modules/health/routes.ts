import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { pingDb } from "../../db/index.js";

export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["System"],
        summary: "Service Health Check",
        description: "Returns application status and uptime",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              uptime: { type: "number" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }
  );

  app.get(
    "/health/db",
    {
      schema: {
        tags: ["System"],
        summary: "Database Health Check",
        description: "Pings the PostgreSQL database connection",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              database: { type: "string" },
              timestamp: { type: "string" },
            },
          },
          503: {
            type: "object",
            properties: {
              status: { type: "string" },
              database: { type: "string" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const isAlive = await pingDb();
      if (!isAlive) {
        return reply.status(503).send({
          status: "error",
          database: "disconnected",
          error: "Could not connect to PostgreSQL database",
        });
      }

      return reply.send({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    }
  );
};
