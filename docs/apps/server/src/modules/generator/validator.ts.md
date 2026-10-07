# Documentation: @/apps/server/src/modules/generator/validator.ts

### Purpose
Performs strict post-generation semantic validation on raw Groq quiz models, verifying question counts, choice cardinalities, single-correctness invariants, distinct labels, and substantive per-option explanations.

### What happens without it
Provisional LLM outputs with subtle invariant failures (e.g., zero or multiple correct options, duplicate options, or placeholder explanations) would leak into persistence and corrupt quiz gameplay.

### Exports
- `validateQuizSemantics(rawQuiz, targetCount)`: Validates that the generated quiz contains exactly `targetCount` questions, checks that `single_choice` has 4 options and `true_false` has 2 options ("True" and "False"), enforces exactly one `isTrue: true` per question, ensures all option labels are distinct, and rejects placeholder explanations (e.g. "correct", "wrong", or under 5 characters). Returns `{ valid: boolean, errors: string[] }`.

### Dependency graph
- Depends on:
  - `@squizme/shared` (`GroqGeneratedQuiz`)
- Depended on by:
  - `@/apps/server/src/modules/generator/service.ts`
