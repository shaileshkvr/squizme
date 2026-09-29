import crypto from 'node:crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { quizzes, questions } from '../../db/schema.js';
import { Question, QuizSettings } from '@squizme/shared';

export async function createQuizWithQuestions(
  userId: string,
  title: string,
  description: string | null,
  sourceType: 'prompt' | 'pdf' | 'docx' | 'manual',
  sourceMetadata: any,
  settings: QuizSettings,
  questionList: Question[]
) {
  const quizId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(quizzes).values({
      id: quizId,
      creatorId: userId,
      title,
      description,
      sourceType,
      sourceMetadata,
      settings,
      isPublished: true
    });

    for (const q of questionList) {
      await tx.insert(questions).values({
        id: q.id || crypto.randomUUID(),
        quizId,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        points: q.points || 1,
        orderIndex: q.orderIndex || 0
      });
    }
  });

  return getQuizById(quizId);
}

export async function listUserQuizzes(userId: string) {
  return db.select().from(quizzes).where(eq(quizzes.creatorId, userId)).orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(quizId: string) {
  const quizRecords = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (quizRecords.length === 0) {
    throw new Error('Quiz not found');
  }
  const qList = await db.select().from(questions).where(eq(questions.quizId, quizId)).orderBy(questions.orderIndex);
  return {
    ...quizRecords[0],
    questions: qList
  };
}
