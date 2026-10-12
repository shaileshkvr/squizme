import type { FastifyInstance } from "fastify";
import { getDocsHtml } from "./portal-html.js";

export async function docsRoutes(app: FastifyInstance): Promise<void> {
  // Developer documentation portal
  app.get("/docs", async (_request, reply) => {
    return reply.type("text/html").send(getDocsHtml());
  });

  app.get("/docs/", async (_request, reply) => {
    return reply.type("text/html").send(getDocsHtml());
  });

  // Raw OpenAPI 3.0 JSON specification
  app.get("/docs/json", async (_request, reply) => {
    return reply.send(app.swagger());
  });
}
