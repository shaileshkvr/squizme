import type { CreateQuizInput, Quiz } from "@squizme/shared";
import { pool } from "../../db/index.js";

export interface QuizSummary {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function listQuizzes(): Promise<QuizSummary[]> {
  const query = `
    SELECT 
      id,
      title,
      description,
      jsonb_array_length(questions) AS question_count,
      created_at,
      updated_at
    FROM quizzes
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    questionCount: Number(row.question_count || 0),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const query = `
    SELECT id, title, description, questions, created_at, updated_at
    FROM quizzes
    WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    questions: row.questions,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  const query = `
    INSERT INTO quizzes (title, description, questions)
    VALUES ($1, $2, $3::jsonb)
    RETURNING id, title, description, questions, created_at, updated_at;
  `;
  const values = [
    input.title,
    input.description || null,
    JSON.stringify(input.questions),
  ];
  const result = await pool.query(query, values);
  const row = result.rows[0];

  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    questions: row.questions,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function deleteQuiz(id: string): Promise<boolean> {
  const query = `DELETE FROM quizzes WHERE id = $1 RETURNING id;`;
  const result = await pool.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
}
