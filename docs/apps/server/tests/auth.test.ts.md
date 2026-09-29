# Documentation: @/apps/server/tests/auth.test.ts

### Purpose
Integration test suite verifying user registration, duplicate prevention, credential verification, JWT authentication, and BYO Gemini API key storage/deletion.

### What happens without it
Regressions in registration validation, password hashing, JWT enforcement, or profile API key encryption could slip into production unnoticed.

### Test Scenarios
- `rejects registration with invalid email`: Asserts 400 Bad Request on invalid format.
- `registers a new user successfully`: Validates password hashing, database insertion, and token generation.
- `rejects duplicate email registration`: Asserts 400 error on duplicate email.
- `authenticates user with valid credentials`: Asserts 200 OK and valid JWT on correct credentials.
- `rejects login with invalid password`: Asserts 401 Unauthorized on wrong password.
- `rejects profile request without authorization token`: Asserts 401 when token is missing.
- `retrieves user profile and saves/removes custom API key`: Tests authenticated profile fetching, AES-256 encrypted key storage, profile verification, and key removal.

### Dependency graph
- Depends on:
  - `vitest`
  - `fastify`
  - `@/apps/server/src/plugins/auth.ts`
  - `@/apps/server/src/modules/auth/routes.ts`
  - `@/apps/server/src/modules/users/routes.ts`
- Depended on by:
  - CI test runner and `pnpm test`
