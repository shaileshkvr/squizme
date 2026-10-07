# Documentation: @/apps/server/src/modules/generator/groq.ts

### Purpose
Implements direct HTTP integration with the Groq Chat Completions API (`openai/gpt-oss-120b`) using native `fetch` and strict JSON Schema output formatting without third-party SDK bloat.

### What happens without it
The server cannot make outbound API requests to Groq or enforce strict structured JSON schema outputs from open weights models.

### Exports
- `GROQ_QUIZ_JSON_SCHEMA`: Strict JSON schema specifying `quiz_generation_response` structure (`title`, `questions`, and per-option `label`, `isTrue`, `explanation` with `additionalProperties: false`).
- `callGroqCompletions(options)`: Dispatches direct POST requests to `https://api.groq.com/openai/v1/chat/completions` with bearer token authentication, request parameters (model, messages, temperature, max_tokens, response_format), and error handling for 401, 429, and 403 API responses.

### Dependency graph
- Depends on:
  - Native Node.js `fetch`
  - Environment variables (`GROQ_API_KEY`, `GROQ_MODEL`)
- Depended on by:
  - `@/apps/server/src/modules/generator/service.ts`
