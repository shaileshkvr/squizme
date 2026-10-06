# Documentation: @/apps/server/src/modules/auth/service.ts

### Purpose
Handles user account creation and password credential verification against PostgreSQL.

### What happens without it
Users cannot register or log in, breaking all account-bound quiz creation and progress tracking.

### Functions
- `registerUser(input: RegisterRequest)`: Checks for duplicate emails, hashes passwords with bcrypt (10 rounds), and persists the new user record with `firstName` and `lastName`. Returns `{ id, email, firstName, lastName, name, role }`.
- `authenticateUser(input: LoginRequest)`: Retrieves user by email, verifies bcrypt password hash, and returns the sanitized user payload including `firstName`, `lastName`, and computed `name` for JWT generation.

### Dependency graph
- Depends on:
  - `bcrypt`
  - `node:crypto`
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
  - `@squizme/shared`
- Depended on by:
  - `@/apps/server/src/modules/auth/routes.ts`
