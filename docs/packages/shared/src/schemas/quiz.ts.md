# Documentation: @/packages/shared/src/schemas/quiz.ts

### Purpose
Declares Zod schemas and TypeScript interfaces for quiz creation, question types, quiz settings, per-option explanations, and Groq-based structured generation outputs.

### What happens without it
The server and client cannot validate question structures, per-option explanations, or LLM generation contracts consistently.

### Key schemas and types
- `QuestionTypeSchema`: Valid question formats (`single_choice`, `multiple_choice`, `true_false`, `short_answer`).
- `QuizOptionSchema`: Schema for per-option evaluation containing `label` (min 1 char), `isTrue` (boolean), and `explanation` (min 1 char).
- `RawGeneratedQuestionSchema`: Provisional question structure emitted by Groq completions containing `question`, `type`, and `options`.
- `GroqGeneratedQuizSchema`: Root provisional LLM generation schema containing `title` and array of `questions`.
- `QuestionOptionSchema`: Persisted option schema supporting `id`, `text`, optional `isTrue`, and optional `explanation`.
- `QuestionSchema`: Full persisted question entity structure with options, correct answer array, and explanation.
- `QuizSettingsSchema`: Configuration for time limits, learning/exam mode, and question shuffling.
- `GenerateQuizRequestSchema`: Constraints for quiz generation requests (bounded between 5 and 50 questions).

### Dependency graph
- Depends on: `zod`
- Depended on by: `@/packages/shared/src/index.ts`
