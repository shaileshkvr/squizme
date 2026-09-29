# Documentation: @/apps/server/src/modules/generator/routes.ts

### Purpose
Exposes protected HTTP endpoints for generating quizzes from prompt topics or uploaded PDF/DOCX documents.

### What happens without it
Clients cannot request automated quiz generation from documents or topic prompts.

### Endpoints
- `POST /generate`: Authenticated endpoint. Handles both multipart file uploads (with single-file 20MB limit) and JSON prompt requests. Inspects `x-gemini-api-key` client headers for BYO encrypted keys. Invokes text extraction, Gemini generation, and saves the quiz transactionally. Returns HTTP 201 with the created quiz or HTTP 403 on `QUOTA_EXHAUSTED`.

### Dependency graph
- Depends on:
  - `fastify`
  - `@squizme/shared`
  - `@/apps/server/src/modules/documents/service.ts`
  - `@/apps/server/src/modules/generator/service.ts`
  - `@/apps/server/src/modules/quizzes/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
