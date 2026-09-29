import { FastifyInstance } from 'fastify';
import { listUserQuizzes, getQuizById } from './service.js';

export async function quizRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    const list = await listUserQuizzes(request.user.id);
    return reply.send(list);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const quiz = await getQuizById(id);
    return reply.send(quiz);
  });
}
