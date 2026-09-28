# Documentation: @/packages/shared/src/schemas/quiz.ts

### Purpose
Declares Zod schemas and TypeScript interfaces for quiz creation, question types, quiz settings, and generation parameters.

### What happens without it
The server and client cannot validate question structures or generation options consistently.

### Key schemas and types
- `QuestionTypeSchema`: Valid question formats (`single_choice`, `multiple_choice`, `true_false`, `short_answer`).
- `QuestionSchema`: Full question entity structure with options, correct answer array, and explanation.
- `QuizSettingsSchema`: Configuration for time limits, learning/exam mode, and question shuffling.
- `GenerateQuizRequestSchema`: Constraints for quiz generation requests (capped at 50 questions max).

### Dependency graph
- Depends on: `zod`
- Depended on by: `@/packages/shared/src/index.ts`
