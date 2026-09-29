# Documentation: @/apps/server/src/modules/quizzes/routes.ts

### Purpose
Provides authenticated HTTP routes for listing a user's authored quizzes and fetching quiz details with full question lists.

### What happens without it
Clients cannot display the quiz library dashboard or load a quiz for starting an attempt.

### Endpoints
- `GET /`: Authenticated. Retrieves all quizzes authored by the requesting user.
- `GET /:id`: Authenticated. Retrieves a single quiz by ID along with its questions.

### Dependency graph
- Depends on:
  - `fastify`
  - `@/apps/server/src/modules/quizzes/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
