# Documentation: @/apps/server/src/db/bootstrap.ts

### Purpose
Provides automated database schema initialization (enums, tables, foreign keys) and pre-seeds the default test user account (`testacc404@gmail.com`) upon server startup if not already present.

### What happens without it
Fresh Docker containers running against uninitialized PostgreSQL databases would fail with relation missing errors unless manual database push and seed commands were executed.

### Functions
- `bootstrapDatabase()`: Creates PostgreSQL enums and tables (`users`, `quizzes`, `questions`, `quiz_attempts`, `attempt_answers`) with `IF NOT EXISTS` guards, and inserts the default test user with bcrypt-hashed credentials if absent.

### Dependency graph
- Depends on:
  - `bcrypt`
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
