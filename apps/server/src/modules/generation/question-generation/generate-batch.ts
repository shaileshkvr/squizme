import type Groq from "groq-sdk";
import { ModelBatchQuestionsOutputSchema } from "@squizme/shared";
import { env } from "../../../config/env.js";
import { callGroqChat } from "../integrations/groq-client.js";
import {
  validateBatchQuestions,
  type RawGeneratedQuestion,
  type ValidatedQuestion,
} from "../validation/validate-batch.js";
import { formatDifficultyDirective as formatDifficulty } from "../../../prompts/question/difficulty.js";
import {
  buildBatchGenerationSystemPrompt,
  buildBatchGenerationUserPrompt,
} from "../../../prompts/tasks/generate-batch.js";

export interface BatchGenerationContext {
  prompt: string;
  mode: string;
  difficulty: string;
  sourceContext?: string;
  batchNumber: number;
  plannedTopics: Array<{ topicName: string; questionCount: number }>;
  previousQuestionPrompts: string[];
}

export function buildSystemPrompt(): string {
  return buildBatchGenerationSystemPrompt();
}

export function formatDifficultyDirective(difficulty: string): string {
  return formatDifficulty(difficulty);
}

export function buildUserPrompt(
  context: BatchGenerationContext,
  topicAllocations: Array<{ topicName: string; questionCount: number }>,
  repairFeedback?: string
): string {
  return buildBatchGenerationUserPrompt({
    prompt: context.prompt,
    mode: context.mode,
    difficulty: context.difficulty,
    topicAllocations,
    sourceContext: context.sourceContext,
    previousQuestionPrompts: context.previousQuestionPrompts,
    repairFeedback,
  });
}

export async function generateBatchQuestions(
  context: BatchGenerationContext,
  groqClient: Groq
): Promise<ValidatedQuestion[]> {
  const totalPlanned = context.plannedTopics.reduce(
    (acc, t) => acc + t.questionCount,
    0
  );
  let remainingTopics = [...context.plannedTopics];
  const acceptedQuestions: ValidatedQuestion[] = [];
  const maxRetries = env.MAX_CONTENT_RETRIES;

  let attempt = 0;
  let repairFeedback: string | undefined;

  while (attempt <= maxRetries && remainingTopics.some((t) => t.questionCount > 0)) {
    attempt++;

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(context, remainingTopics, repairFeedback);

    const rawResponse = await callGroqChat(groqClient, {
      model: env.GROQ_MODEL_GENERATION,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let rawQuestions: RawGeneratedQuestion[] = [];
    try {
      const json = JSON.parse(rawResponse);
      const validated = ModelBatchQuestionsOutputSchema.safeParse(json);
      if (validated.success) {
        rawQuestions = validated.data.questions;
      } else if (Array.isArray(json?.questions)) {
        rawQuestions = json.questions;
      } else {
        repairFeedback = "Model output was not valid JSON schema matching { questions: [...] }.";
        continue;
      }
    } catch {
      repairFeedback = "Model output was not valid JSON. Ensure strictly valid JSON format.";
      continue;
    }

    const validation = validateBatchQuestions({
      questions: rawQuestions,
      expectedTopics: remainingTopics,
      previousQuestionPrompts: [
        ...context.previousQuestionPrompts,
        ...acceptedQuestions.map((q) => q.prompt),
      ],
    });

    acceptedQuestions.push(...validation.accepted);

    // Recalculate remaining topic needs
    const newRemainingTopics: Array<{ topicName: string; questionCount: number }> = [];
    const topicDeficits: string[] = [];

    for (const target of context.plannedTopics) {
      const alreadyAccepted = acceptedQuestions.filter(
        (q) => q.topic === target.topicName
      ).length;
      const deficit = target.questionCount - alreadyAccepted;
      if (deficit > 0) {
        newRemainingTopics.push({ topicName: target.topicName, questionCount: deficit });
        topicDeficits.push(`Topic "${target.topicName}" needs ${deficit} more valid question(s)`);
      }
    }

    remainingTopics = newRemainingTopics;

    if (remainingTopics.length > 0) {
      const rejectionNotes = validation.rejected
        .map((r) => `Rejected question ("${r.question.prompt.slice(0, 40)}..."): ${r.reason}`)
        .slice(0, 5)
        .join("; ");

      repairFeedback = `Missing slots: ${topicDeficits.join(", ")}. Issues noted: ${rejectionNotes}`;
    }
  }

  // Check acceptance ratio
  const acceptanceRatio = acceptedQuestions.length / totalPlanned;
  if (acceptanceRatio >= env.MIN_ACCEPTANCE_RATIO) {
    return acceptedQuestions;
  }

  throw new Error(
    `Batch generation failed: accepted ${acceptedQuestions.length}/${totalPlanned} questions (ratio ${acceptanceRatio.toFixed(
      2
    )} < threshold ${env.MIN_ACCEPTANCE_RATIO})`
  );
}
