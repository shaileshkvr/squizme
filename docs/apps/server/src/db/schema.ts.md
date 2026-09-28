# Documentation: @/apps/server/src/db/schema.ts

### Purpose
Defines the relational data schema for MySQL 8 using Drizzle ORM.

### What happens without it
Drizzle ORM cannot generate SQL migrations or execute type-safe queries against MySQL.

### Tables
- `users`: Account identities, roles, encrypted custom API keys, and free tier counters.
- `quizzes`: Quiz metadata, source type, settings, and creator relationship.
- `questions`: Question prompts, typed options, correct answers, and explanations.
- `quizAttempts`: Session attempts, timings, completion status, and scores.
- `attemptAnswers`: User responses per question with grading results and points.

### Dependency graph
- Depends on:
  - `drizzle-orm/mysql-core`
- Depended on by:
  - `@/apps/server/src/db/index.ts`
  - All domain module services in `apps/server/src/modules/`
