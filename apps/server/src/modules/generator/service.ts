import { GoogleGenAI } from '@google/genai';
import { eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { decryptApiKey } from '../../utils/encryption.js';
import { buildQuestionTools } from './tools.js';
import { GenerateQuizRequest, Question } from '@squizme/shared';

export async function resolveApiKeyAndEnforceQuota(userId: string, requestedCount: number) {
  const records = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (records.length === 0) {
    throw new Error('User not found');
  }
  const user = records[0];

  if (user.customGeminiApiKey) {
    const rawKey = decryptApiKey(user.customGeminiApiKey);
    return { apiKey: rawKey, isCustomKey: true, allowedCount: Math.min(requestedCount, 50) };
  }

  // Free tier host key
  if (user.freeGenerationsUsed >= 2) {
    throw new Error('QUOTA_EXHAUSTED: You have used your 2 free AI quizzes. Please add your Gemini API key in settings to continue.');
  }

  const hostKey = process.env.DEFAULT_GEMINI_API_KEY;
  if (!hostKey) {
    throw new Error('Server default Gemini API key is not configured.');
  }

  return { apiKey: hostKey, isCustomKey: false, allowedCount: Math.min(requestedCount, 10) };
}

export async function generateQuizWithGemini(
  userId: string,
  request: GenerateQuizRequest,
  extractedDocumentText?: string
) {
  const { apiKey, isCustomKey, allowedCount } = await resolveApiKeyAndEnforceQuota(userId, request.questionCount);
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an expert quiz builder. Construct high-quality, engaging, and accurate quizzes.
Scope policy: If the user provides a broad topic, focus on foundational, surface-level principles. If the topic is narrow, test nuanced mechanics.
Depth mode: ${request.depth === 'in_depth' ? 'Create analytical, in-depth questions testing mechanisms and edge cases.' : 'Create high-level foundational questions testing key concepts and definitions.'}
Difficulty: ${request.difficulty}.
Target count: Exactly ${allowedCount} questions.
You MUST invoke the provided question tools to emit each question.
`;

  let userPrompt = '';
  if (extractedDocumentText) {
    userPrompt = `Generate a ${allowedCount}-question quiz from the following document:\n\n${extractedDocumentText.slice(0, 100000)}`;
  } else {
    userPrompt = `Generate a ${allowedCount}-question quiz on the topic: "${request.prompt}".`;
  }

  const config: any = {
    systemInstruction,
    tools: buildQuestionTools(),
    temperature: 0.3
  };

  if (request.researchEnabled && !extractedDocumentText) {
    config.tools.push({ googleSearch: {} });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config
  });

  const parsedQuestions: Question[] = [];
  const functionCalls = response.functionCalls || [];

  let order = 0;
  for (const call of functionCalls) {
    const args: any = call.args;
    if (call.name === 'add_single_choice_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'single_choice',
        prompt: args.prompt,
        options: args.options,
        correctAnswers: [args.correct_option_id],
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_multiple_choice_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        prompt: args.prompt,
        options: args.options,
        correctAnswers: args.correct_option_ids,
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_true_false_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'true_false',
        prompt: args.prompt,
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ],
        correctAnswers: [args.is_true ? 'true' : 'false'],
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_short_answer_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'short_answer',
        prompt: args.prompt,
        options: [],
        correctAnswers: args.accepted_answers,
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    }
  }

  if (parsedQuestions.length === 0) {
    throw new Error('Gemini failed to assemble structured questions. Please try again or rephrase the prompt.');
  }

  // Increment free generation count if host key was used
  if (!isCustomKey) {
    await db.update(users)
      .set({ freeGenerationsUsed: sql`${users.freeGenerationsUsed} + 1` })
      .where(eq(users.id, userId));
  }

  return {
    title: request.prompt || 'Generated Document Quiz',
    description: `AI-generated quiz based on ${extractedDocumentText ? 'uploaded document' : request.prompt}`,
    questions: parsedQuestions
  };
}
