import Fastify, { type FastifyInstance } from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerHelmet } from "./plugins/helmet.js";
import { registerSensible } from "./plugins/sensible.js";
import { registerSwagger } from "./plugins/swagger.js";
import { healthRoutes } from "./modules/health/routes.js";
import { quizRoutes } from "./modules/quizzes/routes.js";
import { attemptRoutes } from "./modules/attempts/routes.js";
import { generatorRoutes } from "./modules/generator/routes.js";
import { docsRoutes } from "./modules/docs/routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
    ajv: {
      customOptions: {
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Core Ecosystem Plugins
  await registerSensible(app);
  await registerCors(app);
  await registerHelmet(app);
  await registerSwagger(app);
  await app.register(docsRoutes);

  // System & Health Routes
  await app.register(healthRoutes);

  // API Domain Routes
  await app.register(quizRoutes, { prefix: "/api" });
  await app.register(attemptRoutes, { prefix: "/api" });
  await app.register(generatorRoutes, { prefix: "/api" });

  // Not Found Handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
    });
  });

  return app;
}
