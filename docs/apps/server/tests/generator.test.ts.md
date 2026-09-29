# Documentation: @/apps/server/tests/generator.test.ts

### Purpose
Unit and integration test suite validating Gemini tool declarations, free tier quota limits, 10-question free caps, and BYO API key quota allowance (up to 50 questions).

### What happens without it
Quota enforcement bugs could allow unauthorized free generations or block paying/BYO-key users.

### Test Scenarios
- `constructs valid tool definitions for Gemini`: Checks that all four question tool types are declared.
- `resolves host key and caps question count to 10 for free users`: Verifies free tier users receive host key capped at 10.
- `blocks quiz generation when free quota is exhausted`: Verifies users with >= 2 generations trigger a `QUOTA_EXHAUSTED` error.
- `uses decrypted custom key and allows up to 50 questions`: Verifies BYO key users bypass free quota with decrypted credentials.

### Dependency graph
- Depends on:
  - `vitest`
  - `@/apps/server/src/modules/generator/tools.ts`
  - `@/apps/server/src/modules/generator/service.ts`
  - `@/apps/server/src/db/index.ts`
- Depended on by:
  - CI test runner and `pnpm test`
