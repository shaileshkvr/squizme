import { FastifyInstance } from 'fastify';
import '@fastify/multipart';
import { GenerateQuizRequestSchema } from '@squizme/shared';
import { generateQuizWithGroq } from './service.js';
import { createQuizWithQuestions } from '../quizzes/service.js';

export async function generatorRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/generate', async (request, reply) => {
    if (request.isMultipart()) {
      return reply.status(400).send({
        error: 'DOCUMENT_UPLOADS_DISABLED',
        message: 'Document uploads are temporarily disabled. Cloudinary privacy pipeline integration pending.'
      });
    }

    const parse = GenerateQuizRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const clientCustomKey = (
        request.headers['x-groq-api-key'] ||
        request.headers['x-custom-api-key'] ||
        request.headers['x-gemini-api-key']
      ) as string | undefined;

      const generated = await generateQuizWithGroq(
        request.user.id,
        parse.data,
        undefined,
        clientCustomKey
      );

      const quiz = await createQuizWithQuestions(
        request.user.id,
        generated.title,
        generated.description,
        'prompt',
        {},
        parse.data.settings,
        generated.questions
      );

      return reply.status(201).send(quiz);
    } catch (err: any) {
      if (err.message && err.message.includes('DOCUMENT_UPLOADS_DISABLED')) {
        return reply.status(400).send({
          error: 'DOCUMENT_UPLOADS_DISABLED',
          message: err.message
        });
      }
      if (err.message && err.message.includes('QUOTA_EXHAUSTED')) {
        return reply.status(403).send({
          error: 'QUOTA_EXHAUSTED',
          message: err.message
        });
      }
      return reply.status(500).send({ error: err.message });
    }
  });
}
