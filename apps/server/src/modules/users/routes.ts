import { FastifyInstance } from 'fastify';
import { UpdateApiKeySchema } from '@squizme/shared';
import { getUserProfile, saveUserApiKey, removeUserApiKey } from './service.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/profile', async (request, reply) => {
    const user = await getUserProfile(request.user.id);
    return reply.send(user);
  });

  fastify.put('/api-key', async (request, reply) => {
    const parse = UpdateApiKeySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }
    await saveUserApiKey(request.user.id, parse.data.apiKey);
    return reply.send({ message: 'API key saved successfully' });
  });

  fastify.delete('/api-key', async (request, reply) => {
    await removeUserApiKey(request.user.id);
    return reply.send({ message: 'Custom API key removed' });
  });
}
