import type {
  AttemptResult,
  AttemptResultDetail,
  SubmitAttemptInput,
} from "@squizme/shared";
import { pool } from "../../db/index.js";
import { getQuizById } from "../quizzes/service.js";

export async function submitAttempt(
  input: SubmitAttemptInput
): Promise<AttemptResult | null> {
  const quiz = await getQuizById(input.quizId);
  if (!quiz) return null;

  const answerMap = new Map(
    input.answers.map((a) => [a.questionId, a.selectedOptionId])
  );

  let score = 0;
  const details: AttemptResultDetail[] = [];

  for (const q of quiz.questions) {
    const selectedOptionId = answerMap.get(q.id) ?? "";
    const correctOption = q.options.find((opt) => opt.isCorrect);
    const correctOptionId = correctOption?.id ?? "";
    const isCorrect = selectedOptionId !== "" && selectedOptionId === correctOptionId;

    if (isCorrect) {
      score += 1;
    }

    details.push({
      questionId: q.id,
      selectedOptionId,
      correctOptionId,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const totalQuestions = quiz.questions.length;
  const percentage = Number(
    ((score / (totalQuestions || 1)) * 100).toFixed(2)
  );

  const query = `
    INSERT INTO attempts (quiz_id, participant_name, score, total_questions, percentage, details)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    RETURNING id, quiz_id, participant_name, score, total_questions, percentage, details, completed_at;
  `;

  const values = [
    input.quizId,
    input.participantName || null,
    score,
    totalQuestions,
    percentage,
    JSON.stringify(details),
  ];

  const result = await pool.query(query, values);
  const row = result.rows[0];

  return {
    id: row.id,
    quizId: row.quiz_id,
    participantName: row.participant_name || undefined,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: Number(row.percentage),
    details: row.details,
    completedAt: row.completed_at.toISOString(),
  };
}

export async function getAttemptById(id: string): Promise<AttemptResult | null> {
  const query = `
    SELECT id, quiz_id, participant_name, score, total_questions, percentage, details, completed_at
    FROM attempts
    WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    quizId: row.quiz_id,
    participantName: row.participant_name || undefined,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: Number(row.percentage),
    details: row.details,
    completedAt: row.completed_at.toISOString(),
  };
}
