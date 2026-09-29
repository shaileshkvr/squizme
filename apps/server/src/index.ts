import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { generatorRoutes } from './modules/generator/routes.js';
import { quizRoutes } from './modules/quizzes/routes.js';
import { attemptRoutes } from './modules/attempts/routes.js';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const server = Fastify({
  logger: true
});

async function main() {
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  await server.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 1
    }
  });

  await server.register(authPlugin);

  // Healthcheck
  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register domain module routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(userRoutes, { prefix: '/api/users' });
  await server.register(generatorRoutes, { prefix: '/api/generator' });
  await server.register(quizRoutes, { prefix: '/api/quizzes' });
  await server.register(attemptRoutes, { prefix: '/api/attempts' });

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
