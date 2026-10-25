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
export const GenerationDifficultySchema = z.enum([
  "easy",
  "medium",
  "mixed_easy_medium",
  "hard",
  "mixed_medium_hard",
]);

export const GenerationRequestSchema = z.object({
  idempotencyKey: z.string().uuid("Invalid idempotency key format"),
  prompt: z
    .string()
    .trim()
    .min(20, "Prompt must be at least 20 characters")
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

export const ModelTopicOutputSchema = z.object({
  name: z.string().trim().min(1, "Topic name cannot be empty"),
  questionCount: z.coerce.number().int().positive("Question count must be positive"),
});

export const ModelCurriculumPlanOutputSchema = z.object({
  topics: z.array(ModelTopicOutputSchema).min(1, "Plan must contain at least one topic"),
});

export const ModelQuestionOptionOutputSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean(),
});

export const ModelQuestionItemOutputSchema = z.object({
  prompt: z.string().trim().min(1, "Question prompt cannot be empty"),
  topic: z.string().trim().min(1, "Topic name cannot be empty"),
  options: z.array(ModelQuestionOptionOutputSchema).min(2, "Question must have at least 2 options"),
  explanation: z.string().trim().optional(),
});

export const ModelBatchQuestionsOutputSchema = z.object({
  questions: z.array(ModelQuestionItemOutputSchema),
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
export type ModelTopicOutput = z.infer<typeof ModelTopicOutputSchema>;
export type ModelCurriculumPlanOutput = z.infer<typeof ModelCurriculumPlanOutputSchema>;
export type ModelQuestionOptionOutput = z.infer<typeof ModelQuestionOptionOutputSchema>;
export type ModelQuestionItemOutput = z.infer<typeof ModelQuestionItemOutputSchema>;
export type ModelBatchQuestionsOutput = z.infer<typeof ModelBatchQuestionsOutputSchema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
