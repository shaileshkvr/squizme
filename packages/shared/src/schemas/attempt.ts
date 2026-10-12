import { z } from "zod";

export const SubmitAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
});

export const SubmitAttemptSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(SubmitAnswerSchema).min(1),
  participantName: z.string().min(1).max(100).optional(),
});

export const AttemptResultDetailSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  correctOptionId: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export const AttemptResultSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  participantName: z.string().optional(),
  score: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  details: z.array(AttemptResultDetailSchema),
  completedAt: z.string(),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type SubmitAttemptInput = z.infer<typeof SubmitAttemptSchema>;
export type AttemptResultDetail = z.infer<typeof AttemptResultDetailSchema>;
export type AttemptResult = z.infer<typeof AttemptResultSchema>;
