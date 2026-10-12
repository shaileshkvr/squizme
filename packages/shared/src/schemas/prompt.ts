import { z } from "zod";

export const GeneratePromptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  apiKey: z.string().optional(),
});

export const PromptResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  receivedPrompt: z.string(),
  promptLength: z.number(),
  groqConfigured: z.boolean(),
  timestamp: z.string(),
});

export type GeneratePromptInput = z.infer<typeof GeneratePromptSchema>;
export type PromptResponse = z.infer<typeof PromptResponseSchema>;
