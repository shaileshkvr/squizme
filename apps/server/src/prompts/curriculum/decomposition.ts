export function curriculumDecompositionDirective(totalQuestions: number): string {
  return `CURRICULUM DECOMPOSITION INVARIANTS:
1. Decompose the requested subject into 2 to 6 balanced, meaningful subtopics.
2. The sum of all questionCount values across all topics MUST equal EXACTLY ${totalQuestions}.
3. Each questionCount MUST be a positive integer.
4. Subtopics should provide balanced conceptual coverage without redundant thematic overlap.
5. Accept any coherent subject — including niche, technical, interdisciplinary, or cross-domain topics. When in doubt, plan it.

REQUIRED JSON FORMAT:
{
  "topics": [
    { "name": "Subtopic Name", "questionCount": 5 }
  ]
}`;
}
