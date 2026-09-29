import { FastifyInstance } from 'fastify';
import { SubmitAttemptSchema } from '@squizme/shared';
import { startQuizAttempt, submitQuizAttempt, getAttemptScorecard } from './service.js';

export async function attemptRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/start/:quizId', async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const session = await startQuizAttempt(request.user.id, quizId);
    return reply.status(201).send(session);
  });

  fastify.post('/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = SubmitAttemptSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }
    const scorecard = await submitQuizAttempt(id, parse.data.answers);
    return reply.send(scorecard);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scorecard = await getAttemptScorecard(id);
    return reply.send(scorecard);
  });
}
