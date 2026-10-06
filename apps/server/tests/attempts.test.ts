import { describe, it, expect, beforeAll } from 'vitest';
import { gradeQuestionAnswer, startQuizAttempt, submitQuizAttempt, getAttemptScorecard } from '../src/modules/attempts/service.js';
import { createQuizWithQuestions } from '../src/modules/quizzes/service.js';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import crypto from 'node:crypto';

describe('Auto-grading Engine & Attempt Flow', () => {
  let userId: string;
  let quizId: string;
  let q1Id: string;
  let q2Id: string;

  beforeAll(async () => {
    userId = crypto.randomUUID();
    q1Id = crypto.randomUUID();
    q2Id = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: `grader-${Date.now()}@example.com`,
      passwordHash: 'hash',
      firstName: 'Test',
      lastName: 'Grader'
    });

    const quiz = await createQuizWithQuestions(
      userId,
      'Cell Biology Quiz',
      'Testing cell structures',
      'prompt',
      {},
      { mode: 'exam', timeLimitMinutes: 10, passingPercentage: 70, shuffleQuestions: false, showExplanationsDuring: false },
      [
        {
          id: q1Id,
          type: 'single_choice',
          prompt: 'What is the powerhouse of the cell?',
          options: [
            { id: 'a', text: 'Nucleus' },
            { id: 'b', text: 'Mitochondria' }
          ],
          correctAnswers: ['b'],
          explanation: 'Mitochondria generate ATP.',
          points: 1,
          orderIndex: 0
        },
        {
          id: q2Id,
          type: 'short_answer',
          prompt: 'Name the organelle containing genetic material:',
          options: [],
          correctAnswers: ['nucleus'],
          explanation: 'The nucleus houses DNA.',
          points: 1,
          orderIndex: 1
        }
      ]
    );

    quizId = quiz.id;
  });

  it('correctly grades single choice questions', () => {
    const correctResult = gradeQuestionAnswer('single_choice', ['b'], 'b', 1);
    expect(correctResult.isCorrect).toBe(true);
    expect(correctResult.pointsEarned).toBe(1);

    const wrongResult = gradeQuestionAnswer('single_choice', ['b'], 'a', 1);
    expect(wrongResult.isCorrect).toBe(false);
    expect(wrongResult.pointsEarned).toBe(0);
  });

  it('correctly grades multiple choice questions', () => {
    const correctResult = gradeQuestionAnswer('multiple_choice', ['a', 'c'], ['a', 'c'], 2);
    expect(correctResult.isCorrect).toBe(true);
    expect(correctResult.pointsEarned).toBe(2);

    const partialWrongResult = gradeQuestionAnswer('multiple_choice', ['a', 'c'], ['a'], 2);
    expect(partialWrongResult.isCorrect).toBe(false);
    expect(partialWrongResult.pointsEarned).toBe(0);
  });

  it('correctly grades true/false questions', () => {
    const result = gradeQuestionAnswer('true_false', ['true'], 'true', 1);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
  });

  it('correctly grades short answer with case insensitivity and whitespace trimming', () => {
    const result = gradeQuestionAnswer('short_answer', ['mitochondria', 'mitochondrion'], '  Mitochondria  ', 2);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(2);
  });

  it('runs a complete attempt flow from start to submission and scorecard retrieval', async () => {
    const session = await startQuizAttempt(userId, quizId);
    expect(session.attemptId).toBeDefined();

    const scorecard = await submitQuizAttempt(session.attemptId, [
      { questionId: q1Id, submittedAnswer: 'b' },
      { questionId: q2Id, submittedAnswer: 'Nucleus' }
    ]);

    expect(scorecard.attempt.status).toBe('completed');
    expect(scorecard.attempt.scoreAwarded).toBe('2.00');
    expect(scorecard.attempt.totalPoints).toBe('2.00');
    expect(scorecard.attempt.percentage).toBe('100.00');
    expect(scorecard.attempt.isPassed).toBe(true);
    expect(scorecard.items).toHaveLength(2);

    const fetchedScorecard = await getAttemptScorecard(session.attemptId);
    expect(fetchedScorecard.attempt.id).toBe(session.attemptId);
    expect(fetchedScorecard.items).toHaveLength(2);
  });
});
