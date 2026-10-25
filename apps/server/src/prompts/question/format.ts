export function questionFormatDirective(): string {
  return `QUESTION STRUCTURE:
- Each question must feature a direct, focused prompt stem.
- When questions or options involve programming code or technical expressions, format them cleanly using standard Markdown code fences with language tags (e.g. \`\`\`typescript ... \`\`\`) or inline backticks (\`variable\`).
- Provide exactly 4 options per question unless explicitly instructed otherwise.
- Each question must include a concise, educational explanation clarifying why the correct option is true and correcting common misconceptions.

REQUIRED JSON SCHEMA:
{
  "questions": [
    {
      "prompt": "Clear, direct question text",
      "topic": "Exact topic name from requested batch allocations",
      "options": [
        { "text": "Choice 1", "isCorrect": true },
        { "text": "Choice 2", "isCorrect": false },
        { "text": "Choice 3", "isCorrect": false },
        { "text": "Choice 4", "isCorrect": false }
      ],
      "explanation": "Clear explanation of why the correct choice is true"
    }
  ]
}`;
}
