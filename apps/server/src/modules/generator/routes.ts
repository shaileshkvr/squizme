import { FastifyInstance } from 'fastify';
import '@fastify/multipart';
import { GenerateQuizRequestSchema } from '@squizme/shared';
import { extractDocumentText } from '../documents/service.js';
import { generateQuizWithGemini } from './service.js';
import { createQuizWithQuestions } from '../quizzes/service.js';

export async function generatorRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/generate', async (request, reply) => {
    let rawData: any = {};
    let extractedText: string | undefined;
    let sourceMeta: any = {};

    if (request.isMultipart()) {
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let filename = '';
      let mimeType = '';

      for await (const part of parts) {
        if (part.type === 'file') {
          filename = part.filename;
          mimeType = part.mimetype;
          fileBuffer = await part.toBuffer();
        } else {
          try {
            rawData[part.fieldname] = typeof part.value === 'string' && (part.value.startsWith('{') || part.value.startsWith('[') || !isNaN(Number(part.value)))
              ? JSON.parse(part.value)
              : part.value;
          } catch {
            rawData[part.fieldname] = part.value;
          }
        }
      }

      if (fileBuffer) {
        extractedText = await extractDocumentText(fileBuffer, mimeType, filename);
        sourceMeta = { filename, size: fileBuffer.length };
      }
    } else {
      rawData = request.body;
    }

    const parse = GenerateQuizRequestSchema.safeParse(rawData);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const clientCustomKey = (request.headers['x-gemini-api-key'] || request.headers['x-custom-api-key']) as string | undefined;
      const generated = await generateQuizWithGemini(request.user.id, parse.data, extractedText, clientCustomKey);
      const quiz = await createQuizWithQuestions(
        request.user.id,
        generated.title,
        generated.description,
        extractedText ? 'pdf' : 'prompt',
        sourceMeta,
        parse.data.settings,
        generated.questions
      );

      return reply.status(201).send(quiz);
    } catch (err: any) {
      if (err.message && err.message.includes('QUOTA_EXHAUSTED')) {
        return reply.status(403).send({ error: 'QUOTA_EXHAUSTED', message: err.message });
      }
      return reply.status(500).send({ error: err.message });
    }
  });
}
