import { z } from "zod";

export const GenerationJobStatusSchema = z.enum([
  "queued",
  "planning",
  "generating",
  "finalizing",
  "cancel_requested",
  "cancelled",
  "completed",
  "failed",
]);

export const GenerationModeSchema = z.enum(["learning", "assessment"]);
export const GenerationDifficultySchema = z.enum(["easy", "medium", "hard"]);

export const GenerationRequestSchema = z.object({
  idempotencyKey: z.string().uuid("Invalid idempotency key format"),
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty")
    .max(5000, "Prompt must not exceed 5000 characters"),
  sourceId: z.string().uuid().optional(),
  mode: GenerationModeSchema.default("learning"),
  difficulty: GenerationDifficultySchema.default("medium"),
  questionCount: z
    .number()
    .int("Question count must be an integer")
    .min(5, "Question count must be at least 5")
    .max(50, "Question count cannot exceed 50")
    .default(10),
});

export const TopicAllocationSchema = z.object({
  name: z.string().min(1, "Topic name cannot be empty"),
  questionCount: z.number().int().positive("Question count must be positive"),
  subtopics: z.array(z.string()).optional(),
  difficultyHint: GenerationDifficultySchema.optional(),
});

export const TopicPlanSchema = z.object({
  topics: z.array(TopicAllocationSchema).min(1, "Topic plan must have at least one topic"),
  totalQuestionCount: z.number().int().positive(),
});

export const JobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const JobStatusResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: GenerationJobStatusSchema,
  plannedQuestionCount: z.number().int(),
  acceptedQuestionCount: z.number().int(),
  completedBatches: z.number().int(),
  totalBatches: z.number().int(),
  quizId: z.string().uuid().nullable(),
  error: JobErrorSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GenerationJobStatus = z.infer<typeof GenerationJobStatusSchema>;
export type GenerationMode = z.infer<typeof GenerationModeSchema>;
export type GenerationDifficulty = z.infer<typeof GenerationDifficultySchema>;
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type TopicAllocation = z.infer<typeof TopicAllocationSchema>;
export type TopicPlan = z.infer<typeof TopicPlanSchema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
