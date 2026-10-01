import { FastifyInstance } from 'fastify';
import { RegisterRequestSchema, LoginRequestSchema } from '@squizme/shared';
import { registerUser, authenticateUser } from './service.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const parse = RegisterRequestSchema.safeParse(request.body);
    if (!parse.success) {
      const firstError = parse.error.errors[0]?.message || 'Validation failed';
      return reply.status(400).send({ error: firstError, details: parse.error.format() });
    }

    try {
      const user = await registerUser(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.status(201).send({ user, token });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post('/login', async (request, reply) => {
    const parse = LoginRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const user = await authenticateUser(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.send({ user, token });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });
}
