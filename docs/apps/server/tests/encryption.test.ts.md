# Documentation: @/apps/server/tests/encryption.test.ts

### Purpose
Unit test suite verifying the cryptographic correctness and round-trip integrity of AES-256-GCM API key encryption and decryption.

### What happens without it
Regressions or breaking changes in encryption key handling, cipher parameters, or serialization could corrupt API keys silently.

### Test Coverage
- Verifies that plain text keys are transformed into formatted `iv:authTag:ciphertext` strings.
- Verifies that decrypting ciphertext reproduces the original plain text key exactly.

### Dependency graph
- Depends on:
  - `vitest`
  - `@/apps/server/src/utils/encryption.ts`
- Depended on by:
  - CI / Test runner (`pnpm --filter @squizme/server test`)
