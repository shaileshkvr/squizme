export function jsonOutputPolicy(): string {
  return `OUTPUT RULES:
- Output MUST be valid, parseable JSON only.
- Do NOT include markdown code fences (e.g. \`\`\`json) outside the JSON object.
- Do NOT include conversational filler, preamble, or commentary outside the JSON response.`;
}

export function questionQualityPolicy(): string {
  return `QUALITY STANDARDS:
- Exactly one option per question MUST have "isCorrect": true.
- All option texts within a question MUST be mutually distinct and unambiguous.
- Do NOT duplicate or closely paraphrase any previous questions.
- Write clear, focused question stems without trick phrasing or grammatical giveaways.`;
}
