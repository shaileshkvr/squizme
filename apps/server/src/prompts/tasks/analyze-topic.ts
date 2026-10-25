import { curriculumPlannerIdentity } from "../core/identity.js";
import { jsonOutputPolicy } from "../core/policy.js";
import { curriculumDecompositionDirective } from "../curriculum/decomposition.js";

export interface BuildCurriculumUserPromptParams {
  prompt: string;
  mode: string;
  difficulty: string;
  totalQuestions: number;
  sourceContext?: string;
}

export function buildCurriculumPlannerSystemPrompt(totalQuestions: number): string {
  return [
    curriculumPlannerIdentity(),
    "",
    jsonOutputPolicy(),
    "",
    curriculumDecompositionDirective(totalQuestions),
  ].join("\n");
}

export function buildCurriculumPlannerUserPrompt(
  params: BuildCurriculumUserPromptParams
): string {
  let userPrompt = `Topic / Request: ${params.prompt}
Mode: ${params.mode}
Difficulty: ${params.difficulty}
Total Questions Required: ${params.totalQuestions}`;

  if (params.sourceContext) {
    userPrompt += `\n\nSource Material Context:\n${params.sourceContext}`;
  }

  return userPrompt;
}
