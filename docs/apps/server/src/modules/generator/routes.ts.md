# Documentation: @/apps/server/src/modules/generator/routes.ts

### Purpose
Exposes protected HTTP endpoints for generating quizzes from prompt topics while blocking multipart document uploads pending Cloudinary privacy pipeline integration.

### What happens without it
Clients cannot request automated quiz generation from topic prompts.

### Endpoints
- `POST /generate`: Authenticated endpoint. Rejects multipart file uploads immediately with HTTP 400 (`DOCUMENT_UPLOADS_DISABLED`). Validates JSON prompt requests using `GenerateQuizRequestSchema`. Inspects `x-groq-api-key`, `x-custom-api-key`, and `x-gemini-api-key` headers for BYO API keys. Invokes `generateQuizWithGroq` and persists the created quiz transactionally. Returns HTTP 201 with the created quiz, HTTP 400 on validation or document upload errors, or HTTP 403 on `QUOTA_EXHAUSTED`.

### Dependency graph
- Depends on:
  - `fastify`
  - `@squizme/shared`
  - `@/apps/server/src/modules/generator/service.ts`
  - `@/apps/server/src/modules/quizzes/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
