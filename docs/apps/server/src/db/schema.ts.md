# Documentation: @/apps/server/src/db/schema.ts

### Purpose
Defines the relational data schema for PostgreSQL 16 using Drizzle ORM (`drizzle-orm/pg-core`).

### What happens without it
Drizzle ORM cannot generate SQL migrations or execute type-safe queries against PostgreSQL.

### Tables & Enums
- `userRoleEnum`: PostgreSQL enum (`user`, `admin`).
- `quizSourceTypeEnum`: PostgreSQL enum (`prompt`, `pdf`, `docx`, `manual`).
- `questionTypeEnum`: PostgreSQL enum (`single_choice`, `multiple_choice`, `true_false`, `short_answer`).
- `attemptStatusEnum`: PostgreSQL enum (`in_progress`, `completed`, `timed_out`, `abandoned`).
- `users`: Account identities, roles, encrypted custom API keys, and free tier counters.
- `quizzes`: Quiz metadata, source type, settings, and creator relationship.
- `questions`: Question prompts, typed options, correct answers, and explanations.
- `quizAttempts`: Session attempts, timings, completion status, and scores.
- `attemptAnswers`: User responses per question with grading results and points.

### Dependency graph
- Depends on:
  - `drizzle-orm/pg-core`
- Depended on by:
  - `@/apps/server/src/db/index.ts`
  - All domain module services in `@/apps/server/src/modules/`
