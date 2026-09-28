# Documentation: @/packages/shared/src/schemas/attempt.ts

### Purpose
Defines Zod validation schemas and TypeScript types for submitting quiz attempts and question answers.

### What happens without it
Quiz attempt submissions cannot be validated consistently between the client frontend and backend API.

### Key schemas and types
- `SubmitAnswerSchema` / `SubmitAnswer`: Validates single question answer submissions (`questionId` string, `submittedAnswer` string or array of strings).
- `SubmitAttemptSchema` / `SubmitAttempt`: Validates an entire quiz attempt payload consisting of an array of submitted answers.

### Dependency graph
- Depends on: `zod`
- Depended on by:
  - `@/packages/shared/src/index.ts`
