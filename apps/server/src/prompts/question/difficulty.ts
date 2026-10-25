import type { GenerationDifficulty } from "@squizme/shared";

export const DIFFICULTY_DIRECTIVES: Record<GenerationDifficulty, string> = {
  easy: "Easy: Focus on foundational recall, core definitions, standard terminology, direct recognition, and basic facts.",
  medium: "Medium: Focus on conceptual application, realistic scenarios, interpretation, and straightforward trade-off comparisons.",
  hard: "Hard: Focus on advanced reasoning, architectural trade-offs, subtle failure modes, competing constraints, and edge-case mastery.",
  mixed_easy_medium: "Mixed Easy & Medium: Evenly balance foundational recall questions and practical scenario-based application questions.",
  mixed_medium_hard: "Mixed Medium & Hard: Evenly balance realistic practical problem-solving questions and deep analytical edge-case questions.",
};

export function formatDifficultyDirective(difficulty: string): string {
  return (
    DIFFICULTY_DIRECTIVES[difficulty as GenerationDifficulty] ||
    `Difficulty: ${difficulty}`
  );
}
