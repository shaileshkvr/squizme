# Documentation: @/apps/server/src/modules/attempts/routes.ts

### Purpose
Exposes protected HTTP endpoints for initiating quiz sessions, submitting answers for automated scoring, and retrieving scorecards.

### What happens without it
Clients cannot take quizzes, submit answers, or display completion metrics and review rationales.

### Endpoints
- `POST /start/:quizId`: Initiates a new attempt session for the caller.
- `POST /:id/submit`: Validates submitted answers via `SubmitAttemptSchema`, computes score, and returns the completed scorecard.
- `GET /:id`: Retrieves the attempt scorecard and detailed feedback for review.

### Dependency graph
- Depends on:
  - `fastify`
  - `@squizme/shared`
  - `@/apps/server/src/modules/attempts/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
