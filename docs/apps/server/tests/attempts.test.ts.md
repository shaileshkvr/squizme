# Documentation: @/apps/server/tests/attempts.test.ts

### Purpose
Integration test suite verifying auto-grading logic across all question types and full lifecycle execution of quiz attempts.

### What happens without it
Grading regressions (such as incorrect array comparison or broken short answer matching) could corrupt participant scores and certificates.

### Test Scenarios
- `correctly grades single choice questions`: Tests exact match behavior.
- `correctly grades multiple choice questions`: Tests subset rejection and full set verification.
- `correctly grades true/false questions`: Tests boolean correctness.
- `correctly grades short answer with case insensitivity and whitespace trimming`: Verifies robust string normalization.
- `runs a complete attempt flow from start to submission and scorecard retrieval`: Verifies transactional persistence and accurate percentage calculation.

### Dependency graph
- Depends on:
  - `vitest`
  - `@/apps/server/src/modules/attempts/service.ts`
  - `@/apps/server/src/modules/quizzes/service.ts`
  - `@/apps/server/src/db/index.ts`
- Depended on by:
  - CI test runner and `pnpm test`
