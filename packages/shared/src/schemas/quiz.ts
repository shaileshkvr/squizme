import { z } from "zod";

export const QuestionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(QuestionOptionSchema).min(2),
  explanation: z.string().optional(),
});

export const CreateQuizSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(QuestionSchema).min(1),
});

export const QuizSchema = CreateQuizSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
