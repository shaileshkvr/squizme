import type Groq from "groq-sdk";
import { env } from "../../../config/env.js";
import { callGroqChat } from "../integrations/groq-client.js";
import {
  validateBatchQuestions,
  type RawGeneratedQuestion,
  type ValidatedQuestion,
} from "../validation/validate-batch.js";

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
  return `You are an expert educational assessment developer. Generate high-quality multiple-choice questions adhering strictly to the requested topics, counts, and difficulty.

CRITICAL RULES:
1. Return ONLY a valid JSON object matching this schema:
   {
     "questions": [
       {
         "prompt": "Clear, direct question text",
         "topic": "Exact topic name from requested topics",
         "options": [
           { "text": "Choice 1", "isCorrect": true },
           { "text": "Choice 2", "isCorrect": false },
           { "text": "Choice 3", "isCorrect": false },
           { "text": "Choice 4", "isCorrect": false }
         ],
         "explanation": "Clear explanation of why the correct choice is true"
       }
     ]
   }
2. Exactly one option must have "isCorrect": true per question.
3. All option texts must be distinct and plausible.
4. Do NOT repeat or paraphrase any previously generated questions.
5. Do NOT include markdown code blocks (e.g. \`\`\`json) outside the JSON object. Return the raw JSON object.`;
}

export function formatDifficultyDirective(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "Easy (foundational concepts, direct definitions, basic recall)";
    case "medium":
      return "Medium (application, scenario-based understanding, trade-off comparisons)";
    case "mixed_easy_medium":
      return "Mixed Easy & Medium (evenly balance foundational concept questions and practical application questions)";
    case "hard":
      return "Hard (complex problem-solving, architectural trade-offs, edge cases, subtle failure modes)";
    case "mixed_medium_hard":
      return "Mixed Medium & Hard (evenly balance practical application questions and deep analytical edge-case questions)";
    default:
      return difficulty;
  }
}

export function buildUserPrompt(
  context: BatchGenerationContext,
  topicAllocations: Array<{ topicName: string; questionCount: number }>,
  repairFeedback?: string
): string {
  const topicList = topicAllocations
    .map((t) => `- Topic "${t.topicName}": ${t.questionCount} question(s) required`)
    .join("\n");

  let prompt = `Subject / Instruction: ${context.prompt}
Target Difficulty: ${formatDifficultyDirective(context.difficulty)}
Learning Mode: ${context.mode}

REQUIRED QUESTION ALLOCATIONS FOR THIS BATCH:
${topicList}
`;

  if (context.sourceContext) {
    prompt += `\nSOURCE MATERIAL:\n${context.sourceContext}\n`;
  }

  if (context.previousQuestionPrompts.length > 0) {
    prompt += `\nDO NOT DUPLICATE THESE PREVIOUS QUESTIONS:\n${context.previousQuestionPrompts
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join("\n")}\n`;
  }

  if (repairFeedback) {
    prompt += `\nREPAIR FEEDBACK FROM PREVIOUS ATTEMPT:\n${repairFeedback}\nPlease replace the failed slots with valid questions.\n`;
  }

  return prompt;
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

    let parsed: { questions?: RawGeneratedQuestion[] };
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      repairFeedback = "Model output was not valid JSON. Ensure strictly valid JSON format.";
      continue;
    }

    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

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
