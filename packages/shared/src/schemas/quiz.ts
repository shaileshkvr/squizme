import { z } from 'zod';

export const QuestionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer'
]);

export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: QuestionTypeSchema,
  prompt: z.string().min(3),
  options: z.array(QuestionOptionSchema).default([]),
  correctAnswers: z.array(z.string()).min(1),
  explanation: z.string().min(1),
  points: z.number().int().min(1).default(1),
  orderIndex: z.number().int().default(0)
});

export const QuizSettingsSchema = z.object({
  mode: z.enum(['learning', 'exam']).default('learning'),
  timeLimitMinutes: z.number().int().positive().nullable().default(null),
  passingPercentage: z.number().min(0).max(100).default(70),
  shuffleQuestions: z.boolean().default(false),
  showExplanationsDuring: z.boolean().default(true)
});

export const GenerateQuizRequestSchema = z.object({
  prompt: z.string().optional(),
  researchEnabled: z.boolean().default(false),
  questionCount: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  depth: z.enum(['foundational', 'in_depth']).default('foundational'),
  allowedTypes: z.array(QuestionTypeSchema).min(1).default(['single_choice', 'true_false']),
  settings: QuizSettingsSchema.default({})
});

export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuizSettings = z.infer<typeof QuizSettingsSchema>;
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;
