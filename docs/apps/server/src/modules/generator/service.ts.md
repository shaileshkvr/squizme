# Documentation: @/apps/server/src/modules/generator/service.ts

### Purpose
Orchestrates Gemini generation, resolves BYO personal key vs host default key, enforces the 2-free-quiz quota limit, and maps Gemini tool calls to typed `Question` entities.

### What happens without it
The server cannot synthesize AI quizzes or enforce billing/quota rules.

### Functions
- `resolveApiKeyAndEnforceQuota(userId, requestedCount, clientCustomKey)`: Determines if the caller provided an ephemeral custom API key via headers or has one in DB (allows up to 50 questions), or is on the free tier (max 2 quizzes, 10 questions each). Throws `QUOTA_EXHAUSTED` when the free limit is exceeded.
- `generateQuizWithGemini(userId, request, extractedDocumentText, clientCustomKey)`: Configures system instructions, search grounding tools, and calls Gemini 2.5 Flash. Parses function tool calls into questions and increments free generation counts when using server quota.

### Dependency graph
- Depends on:
  - `@google/genai`
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
  - `@/apps/server/src/utils/encryption.ts`
  - `@/apps/server/src/modules/generator/tools.ts`
  - `@squizme/shared`
- Depended on by:
  - `@/apps/server/src/modules/generator/routes.ts`
