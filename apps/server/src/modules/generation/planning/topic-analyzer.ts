import type Groq from "groq-sdk";
import {
  ModelCurriculumPlanOutputSchema,
  type TopicPlan,
} from "@squizme/shared";
import { env } from "../../../config/env.js";
import { callGroqChat } from "../integrations/groq-client.js";
import {
  buildCurriculumPlannerSystemPrompt,
  buildCurriculumPlannerUserPrompt,
} from "../../../prompts/tasks/analyze-topic.js";

export class TopicRejectionError extends Error {
  constructor(
    public readonly code: string = "TOPIC_REJECTED",
    message: string = "That doesn't look like a real topic."
  ) {
    super(message.length > 50 ? message.slice(0, 47) + "..." : message);
    this.name = "TopicRejectionError";
  }
}

/**
 * Deterministic pre-flight check. Only catches input with zero semantic
 * content — repeated characters, keyboard runs, or no recognizable words.
 * Anything composed of real words (even across unrelated domains) passes.
 */
export function isObviousNonContent(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 4) return true;

  // Collapse repeated characters — "aaaaaaa" → "a"
  const collapsed = trimmed.replace(/(.)\1{3,}/g, "$1");
  if (collapsed.length < trimmed.length * 0.4) return true;

  // Keyboard row runs / mash sequences
  const normalized = trimmed.toLowerCase();
  const keyboardPatterns = [
    "asdfjkl",
    "asdfghjkl",
    "qwertyuiop",
    "zxcvbnm",
    "qwerasdf",
    "12345678",
  ];
  if (keyboardPatterns.some((pattern) => normalized.includes(pattern))) {
    return true;
  }

  return false;
}

export async function analyzeTopicsAndPlan(
  prompt: string,
  totalQuestions: number,
  mode: string,
  difficulty: string,
  groqClient: Groq,
  sourceContext?: string
): Promise<TopicPlan> {
  // Deterministic guardrail — catches keyboard mashing before burning tokens
  if (isObviousNonContent(prompt)) {
    throw new TopicRejectionError(
      "TOPIC_REJECTED",
      "That doesn't look like a real topic."
    );
  }

  const systemPrompt = buildCurriculumPlannerSystemPrompt(totalQuestions);
  const userPrompt = buildCurriculumPlannerUserPrompt({
    prompt,
    mode,
    difficulty,
    totalQuestions,
    sourceContext,
  });

  let rawTopics: Array<{ name: string; questionCount: number }>;

  try {
    const raw = await callGroqChat(groqClient, {
      model: env.GROQ_MODEL_PLANNING,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });
    const json = JSON.parse(raw);
    const validated = ModelCurriculumPlanOutputSchema.safeParse(json);
    if (validated.success && validated.data.topics.length > 0) {
      rawTopics = validated.data.topics;
    } else {
      rawTopics = [{ name: prompt.slice(0, 50), questionCount: totalQuestions }];
    }
  } catch (err) {
    if (err instanceof TopicRejectionError) {
      throw err;
    }
    // Fallback if model failed or invalid JSON: generate a default single topic plan
    rawTopics = [{ name: prompt.slice(0, 50), questionCount: totalQuestions }];
  }

  // Deterministic arithmetic enforcement
  // Guarantee sum equals totalQuestions exactly
  let currentSum = 0;
  const cleanedTopics = rawTopics.map((t, idx) => {
    const count = Math.max(1, Math.floor(Number(t.questionCount) || 1));
    currentSum += count;
    return {
      name: (t.name && String(t.name).trim()) || `Topic ${idx + 1}`,
      questionCount: count,
    };
  });

  const diff = totalQuestions - currentSum;
  if (diff !== 0) {
    // Add/subtract diff from the largest topic
    cleanedTopics.sort((a, b) => b.questionCount - a.questionCount);
    cleanedTopics[0].questionCount += diff;
    if (cleanedTopics[0].questionCount <= 0) {
      cleanedTopics[0].questionCount = 1;
    }
  }

  // Final sanity assertion
  const finalSum = cleanedTopics.reduce((acc, t) => acc + t.questionCount, 0);
  if (finalSum !== totalQuestions) {
    cleanedTopics[0].questionCount += totalQuestions - finalSum;
  }

  return {
    topics: cleanedTopics,
    totalQuestionCount: totalQuestions,
  };
}
