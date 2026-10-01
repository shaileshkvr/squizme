import { FastifyInstance } from 'fastify';
import { UpdateApiKeySchema, ChangePasswordSchema, UpdateProfileSchema } from '@squizme/shared';
import { getUserProfile, saveUserApiKey, removeUserApiKey, updateUserProfile, changeUserPassword } from './service.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/profile', async (request, reply) => {
    const user = await getUserProfile(request.user.id);
    return reply.send(user);
  });

  fastify.patch('/profile', async (request, reply) => {
    const parse = UpdateProfileSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }
    const updated = await updateUserProfile(request.user.id, parse.data.name);
    return reply.send(updated);
  });

  fastify.post('/change-password', async (request, reply) => {
    const parse = ChangePasswordSchema.safeParse(request.body);
    if (!parse.success) {
      const firstError = parse.error.errors[0]?.message || 'Validation failed';
      return reply.status(400).send({ error: firstError, details: parse.error.format() });
    }
    try {
      await changeUserPassword(request.user.id, parse.data.currentPassword, parse.data.newPassword);
      return reply.send({ message: 'Password changed successfully' });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
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
