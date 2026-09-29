import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { quizAttempts, attemptAnswers, questions, quizzes } from '../../db/schema.js';
import { SubmitAnswer } from '@squizme/shared';

export function gradeQuestionAnswer(
  type: string,
  correctAnswers: string[],
  submitted: string | string[],
  points: number
): { isCorrect: boolean; pointsEarned: number } {
  if (type === 'single_choice' || type === 'true_false') {
    const isCorrect = Array.isArray(submitted) ? submitted[0] === correctAnswers[0] : submitted === correctAnswers[0];
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  if (type === 'multiple_choice') {
    const submittedArray = Array.isArray(submitted) ? submitted : [submitted];
    const isCorrect = correctAnswers.length === submittedArray.length &&
      correctAnswers.every((ans) => submittedArray.includes(ans));
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  if (type === 'short_answer') {
    const text = (Array.isArray(submitted) ? submitted[0] : submitted || '').trim().toLowerCase();
    const isCorrect = correctAnswers.some((ans) => ans.trim().toLowerCase() === text);
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  return { isCorrect: false, pointsEarned: 0 };
}

export async function startQuizAttempt(userId: string, quizId: string) {
  const attemptId = crypto.randomUUID();
  const startedAt = new Date();
  await db.insert(quizAttempts).values({
    id: attemptId,
    quizId,
    userId,
    startedAt,
    status: 'in_progress'
  });
  return { attemptId, quizId, startedAt };
}

export async function submitQuizAttempt(attemptId: string, answers: SubmitAnswer[]) {
  const attemptRecords = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attemptRecords.length === 0) {
    throw new Error('Attempt not found');
  }
  const attempt = attemptRecords[0];

  const quizRecords = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId)).limit(1);
  const passingPercentage = (quizRecords[0]?.settings as any)?.passingPercentage ?? 70;

  const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, attempt.quizId));

  let totalPossible = 0;
  let totalScore = 0;

  await db.transaction(async (tx) => {
    for (const q of quizQuestions) {
      totalPossible += q.points;
      const userSubmission = answers.find((a) => a.questionId === q.id);
      const submitted = userSubmission ? userSubmission.submittedAnswer : '';

      const { isCorrect, pointsEarned } = gradeQuestionAnswer(
        q.type,
        q.correctAnswers as string[],
        submitted,
        q.points
      );

      totalScore += pointsEarned;

      await tx.insert(attemptAnswers).values({
        id: crypto.randomUUID(),
        attemptId,
        questionId: q.id,
        submittedAnswer: submitted,
        isCorrect,
        pointsEarned: pointsEarned.toString(),
        gradedFeedback: q.explanation
      });
    }

    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    const isPassed = percentage >= passingPercentage;

    await tx.update(quizAttempts).set({
      completedAt: new Date(),
      status: 'completed',
      scoreAwarded: totalScore.toString(),
      totalPoints: totalPossible.toString(),
      percentage: percentage.toFixed(2),
      isPassed
    }).where(eq(quizAttempts.id, attemptId));
  });

  return getAttemptScorecard(attemptId);
}

export async function getAttemptScorecard(attemptId: string) {
  const attempts = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attempts.length === 0) {
    throw new Error('Attempt not found');
  }
  const attempt = attempts[0];
  const items = await db.select().from(attemptAnswers).where(eq(attemptAnswers.attemptId, attemptId));
  return { attempt, items };
}
