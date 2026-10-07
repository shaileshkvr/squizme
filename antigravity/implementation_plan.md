# Implementation Plan: Groq AI Quiz Generator Backend Overhaul

## 1. Overview
This plan implements the backend overhaul specified in `design_suggestion.md` and user requirements:
- Replace Gemini generation with Groq direct HTTP client targeting `openai/gpt-oss-120b` (configurable via `GROQ_MODEL`).
- Use `GROQ_API_KEY` from `.env` and support encrypted BYO user keys.
- Simplify question formats to `single_choice` (4 options) and `true_false` (2 options) with per-option educational explanations.
- Enforce strict JSON schema on Groq completions and application-level Zod semantic validation.
- Implement a bounded machine-oriented repair loop (max 2 retries).
- Strict untrusted data boundaries (`<source_material>...</source_material>`) against prompt injection.
- Application-owned UUID assignment and database persistence.
- Complete unit/integration testing and 1:1 documentation mirroring in `docs/`.

---

## 2. Tasks Breakdown

### Task 1: Update Shared Data Contracts (`@squizme/shared`)
- File: `packages/shared/src/schemas/quiz.ts`
- Tests: `packages/shared/tests/schemas.test.ts`
- Define `QuizOptionSchema` (`label`, `isTrue`, `explanation`).
- Update `QuestionTypeSchema` to focus on `'single_choice' | 'true_false'`.
- Define raw generated quiz output schema `GroqGeneratedQuizSchema`.

### Task 2: Implement Direct Groq HTTP Client & Strict Schema
- File: `apps/server/src/modules/generator/groq.ts`
- Tests: `apps/server/tests/groq.test.ts`
- Native `fetch` calling `https://api.groq.com/openai/v1/chat/completions`.
- Strict JSON schema for `quiz_generation_response`.
- Error translation for Groq permissions, rate limits, and authentication errors.

### Task 3: Implement Semantic Validator & Bounded Repair Loop
- Files: `apps/server/src/modules/generator/validator.ts`, `apps/server/src/modules/generator/service.ts`
- Tests: `apps/server/tests/generator.test.ts`
- Semantic validator: checks exact question count, 1 `isTrue: true` per question, distinct option labels, substantive explanations.
- Prompt construction with `<source_material>` injection boundary and cognitive difficulty criteria (Easy/Medium/Hard).
- Bounded repair loop: max 2 retries sending deterministic errors back to model.
- Backend UUID assignment for quizzes and questions.

### Task 4: Clean Up Obsolete Gemini Generator Code & Route Verification
- Files: `apps/server/src/modules/generator/routes.ts`, `apps/server/src/modules/quizzes/service.ts`
- Delete: `apps/server/src/modules/generator/tools.ts`
- Verify quiz routes and DB persistence cleanly store `{ label, isTrue, explanation }[]`.

### Task 5: Monorepo Verification & 100% Mirrored Documentation
- Files: `docs/apps/server/src/modules/generator/service.ts.md`, `docs/apps/server/src/modules/generator/groq.ts.md`, `docs/apps/server/src/modules/generator/validator.ts.md`, `docs/packages/shared/src/schemas/quiz.ts.md`, `about.md`.
- Run `pnpm build` and `pnpm test`.
