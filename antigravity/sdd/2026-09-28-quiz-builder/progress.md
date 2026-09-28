# SDD ledger — plan: docs/superpowers/plans/2026-09-28-quiz-builder.md

## Pre-flight Conflict Scan

| Task Pair | Produces / Consumes Interface | Finding / Status | Ruling |
|---|---|---|---|
| Task 1 & Task 2 | Root workspace / `@squizme/shared` | Clean — workspace glob matches `packages/*` | Clean |
| Task 2 & Task 3 | Zod schemas / Drizzle MySQL schema | Clean — types match: UUID PKs, settings JSON, question fields | Clean |
| Task 3 & Task 4 | AES-256-GCM encryption / API key service | Clean — `encryptApiKey` / `decryptApiKey` format matches | Clean |
| Task 2 & Task 6 | `GenerateQuizRequestSchema` / Gemini service | Clean — question types and quota limits match | Clean |
| Task 5 & Task 6 | `extractDocumentText` / Multipart generator route | Clean — 20MB limit and format guards aligned | Clean |
| Task 2 & Task 7 | `SubmitAttemptSchema` / Auto-grading service | Clean — answer comparison contracts match | Clean |
| Task 8 & Tasks 4-7 | Fastify server / Domain module routes | Clean — route prefixes `/api/...` consistent | Clean |
| Task 9 & Tasks 10-12 | Client router & AuthContext / Pages | Clean — state and route paths consistent | Clean |
| Task 13 & Tasks 8, 9 | Dockerfile / Server dist & client dist | Clean — multi-stage build references correct dist paths | Clean |

Scan result: Clean, zero cross-task interface conflicts detected.
