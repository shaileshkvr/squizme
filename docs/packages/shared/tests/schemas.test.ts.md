# Documentation: @/packages/shared/tests/schemas.test.ts

### Purpose
Unit test suite verifying Zod schemas and validation constraints across user, quiz, and attempt domains in `@squizme/shared`.

### What happens without it
Schema regressions, broken constraints, or serialization bugs could go undetected during development.

### Test Coverage
- Validates single choice question parsing with `QuestionSchema`.
- Rejects quiz generation requests exceeding maximum question count (50) with `GenerateQuizRequestSchema`.
- Validates user registration constraint logic with `RegisterRequestSchema`.
- Validates login credential constraints with `LoginRequestSchema`.
- Validates Gemini API key constraints with `UpdateApiKeySchema`.
- Validates quiz attempt submission structure with `SubmitAttemptSchema`.
- Validates quiz settings defaults and constraints with `QuizSettingsSchema`.

### Dependency graph
- Depends on:
  - `vitest`
  - `@/packages/shared/src/index.ts`
- Depended on by:
  - CI / Test runner (`pnpm test`)
