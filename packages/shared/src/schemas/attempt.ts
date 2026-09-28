import { z } from 'zod';

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  submittedAnswer: z.union([z.array(z.string()), z.string()])
});

export const SubmitAttemptSchema = z.object({
  answers: z.array(SubmitAnswerSchema)
});

export type SubmitAnswer = z.infer<typeof SubmitAnswerSchema>;
export type SubmitAttempt = z.infer<typeof SubmitAttemptSchema>;
