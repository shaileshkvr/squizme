import { assessmentDeveloperIdentity } from "../core/identity.js";
import { jsonOutputPolicy, questionQualityPolicy } from "../core/policy.js";
import { distractorDesignDirective } from "../question/distractor.js";
import { formatDifficultyDirective } from "../question/difficulty.js";
import { questionFormatDirective } from "../question/format.js";

export interface BuildBatchGenerationUserPromptParams {
  prompt: string;
  mode: string;
  difficulty: string;
  topicAllocations: Array<{ topicName: string; questionCount: number }>;
  sourceContext?: string;
  previousQuestionPrompts?: string[];
  repairFeedback?: string;
}

export function buildBatchGenerationSystemPrompt(): string {
  return [
    assessmentDeveloperIdentity(),
    "",
    jsonOutputPolicy(),
    "",
    questionQualityPolicy(),
    "",
    questionFormatDirective(),
    "",
    distractorDesignDirective(),
  ].join("\n");
}

export function buildBatchGenerationUserPrompt(
  params: BuildBatchGenerationUserPromptParams
): string {
  const topicList = params.topicAllocations
    .map((t) => `- Topic "${t.topicName}": ${t.questionCount} question(s) required`)
    .join("\n");

  let prompt = `Subject / Instruction: ${params.prompt}
Target Difficulty: ${formatDifficultyDirective(params.difficulty)}
Learning Mode: ${params.mode}

REQUIRED QUESTION ALLOCATIONS FOR THIS BATCH:
${topicList}
`;

  if (params.sourceContext) {
    prompt += `\nSOURCE MATERIAL:\n${params.sourceContext}\n`;
  }

  if (params.previousQuestionPrompts && params.previousQuestionPrompts.length > 0) {
    prompt += `\nDO NOT DUPLICATE THESE PREVIOUS QUESTIONS:\n${params.previousQuestionPrompts
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join("\n")}\n`;
  }

  if (params.repairFeedback) {
    prompt += `\nREPAIR FEEDBACK FROM PREVIOUS ATTEMPT:\n${params.repairFeedback}\nPlease replace the failed slots with valid questions.\n`;
  }

  return prompt;
}
