# Documentation: @/apps/server/src/modules/generator/service.ts

### Purpose
Orchestrates AI quiz generation using Groq (`openai/gpt-oss-120b`), executes bounded multi-attempt repair loops on semantic or schema errors, enforces user quotas, guards untrusted data boundaries, blocks unverified document ingestion, and transforms validated provisional outputs into persisted entities with backend-assigned UUIDs.

### What happens without it
The backend cannot generate AI quizzes, cannot self-heal provisional LLM errors, and cannot enforce API quota boundaries.

### Functions
- `resolveApiKeyAndEnforceQuota(userId, requestedCount, clientCustomKey)`: Determines whether the user provided a custom Groq API key (allows up to 50 questions) or relies on the free tier host key (max 2 quizzes, 10 questions each). Throws `QUOTA_EXHAUSTED` when free credits are consumed.
- `generateQuizWithGroq(userId, request, extractedDocumentText, clientCustomKey)`: Wraps topic prompts in `<source_material>` boundary tags, establishes cognitive difficulty rules, executes an initial completion and up to 2 repair retries if semantic validation fails, maps options to `{ id, text, isTrue, explanation }`, assigns backend UUIDs, increments free quotas, and blocks document ingestion (`DOCUMENT_UPLOADS_DISABLED`).
- `generateQuizWithGemini`: Backward-compatible alias for `generateQuizWithGroq`.

### Dependency graph
- Depends on:
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
  - `@/apps/server/src/utils/encryption.ts`
  - `@/apps/server/src/modules/generator/groq.ts`
  - `@/apps/server/src/modules/generator/validator.ts`
  - `@squizme/shared`
- Depended on by:
  - `@/apps/server/src/modules/generator/routes.ts`
