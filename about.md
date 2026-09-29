# About Squizme

Squizme is an AI-powered quiz generation platform built as a TypeScript modular monolith. It ingests source material—either raw lecture documents (PDF/DOCX) or conceptual topic prompts grounded by Google Search—and synthesizes structured, pedagogical quizzes using Google's Gemini models.

---

## Features & Modules

### 1. Monorepo Foundation & Workspace Setup
- **Purpose**: Establishes a strict, cohesive development environment where frontend and backend packages share validation schemas and types without code duplication.
- **Implementation**: Managed via `pnpm` workspaces with root `tsconfig.base.json` compiler rules and isolated package boundaries.
- **Important Files**: [`package.json`](file:///home/shailesh/Projects/squizme/package.json), [`pnpm-workspace.yaml`](file:///home/shailesh/Projects/squizme/pnpm-workspace.yaml).
- **Caveats**: Native binary packages like `bcrypt` and `esbuild` require explicit build permissions configured in `pnpm-workspace.yaml`.

### 2. Shared Data Contracts (`@squizme/shared`)
- **Purpose**: Defines common Zod schemas and TypeScript interfaces for accounts, generation requests, question formats, and attempt submissions.
- **Implementation**: Pure ESM library exporting schemas for single choice, multiple choice, true/false, and short answer questions, along with execution mode settings.
- **Important Files**: [`packages/shared/src/schemas/quiz.ts`](file:///home/shailesh/Projects/squizme/packages/shared/src/schemas/quiz.ts), [`packages/shared/src/schemas/user.ts`](file:///home/shailesh/Projects/squizme/packages/shared/src/schemas/user.ts).
- **Caveats**: ESM packages consumed across Vite and Node require explicit file extension paths in exports.

### 3. Database Layer & Encryption
- **Purpose**: Persists users, quizzes, questions, and attempt submissions reliably in PostgreSQL with AES-256-GCM encryption for stored user API keys.
- **Implementation**: Built with Drizzle ORM (`drizzle-orm/pg-core` and `postgres` driver). The schema tracks user identities, custom API keys, quizzes, questions, attempt states, and answers.
- **Important Files**: [`apps/server/src/db/schema.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/db/schema.ts), [`apps/server/src/utils/encryption.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/utils/encryption.ts).
- **Caveats**: `ENCRYPTION_KEY` must be exactly a 64-character hex string (32 bytes).

### 4. Authentication & Profile Management
- **Purpose**: Handles user identity, JWT issuance, and BYO API key storage.
- **Implementation**: Password hashing with `bcrypt` (10 rounds), token issuance with `@fastify/jwt`, and endpoints for profile retrieval and key management.
- **Important Files**: [`apps/server/src/modules/auth/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/auth/service.ts), [`apps/server/src/modules/users/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/users/service.ts).
- **Caveats**: Passwords require a minimum length of 8 characters.

### 5. Document Ingestion Guardrails
- **Purpose**: Extracts plain text from study material while protecting server memory.
- **Implementation**: Uses `pdf-parse` for PDFs and `mammoth` for DOCX files, enforcing a 20MB single-file limit and a 50-character minimum content threshold.
- **Important Files**: [`apps/server/src/modules/documents/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/documents/service.ts).
- **Caveats**: Scanned image PDFs without selectable text layers cannot be extracted without an OCR preprocessing pipeline.

### 6. Gemini Generation Engine
- **Purpose**: Generates high-quality structured quizzes based on prompt or document context.
- **Implementation**: Connects via `@google/genai` to Gemini 2.5 Flash using tool calls (`add_single_choice_question`, `add_multiple_choice_question`, `add_true_false_question`, `add_short_answer_question`). It enforces the 2-free-quiz quota (10 questions cap) for host-funded keys and allows up to 50 questions for users who bring their own key.
- **Important Files**: [`apps/server/src/modules/generator/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/generator/service.ts), [`apps/server/src/modules/generator/tools.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/generator/tools.ts).
- **Caveats**: Free host tier is capped at 2 generations per account. When exhausted, the server returns HTTP 403 `QUOTA_EXHAUSTED`.

### 7. Quiz Runner & Auto-Grading Engine
- **Purpose**: Evaluates student responses across question formats and computes scorecard statistics.
- **Implementation**: Auto-grades exact matches, multiple selections, and case-insensitive trimmed short answers in database transactions.
- **Important Files**: [`apps/server/src/modules/attempts/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/attempts/service.ts), [`apps/server/src/modules/quizzes/service.ts`](file:///home/shailesh/Projects/squizme/apps/server/src/modules/quizzes/service.ts).
- **Caveats**: Multiple-choice questions require all correct options to be selected for full points.

### 8. Single Page Application (React 19)
- **Purpose**: Clean, accessible web client for generating, taking, and reviewing quizzes.
- **Implementation**: Vite + React 19 + Tailwind CSS v4 + Lucide icons. Includes a 3-step walkthrough modal linking to Google AI Studio, a quiz builder with depth selectors and scope recommendations, and an interactive quiz player with Learning and Exam modes.
- **Important Files**: [`apps/client/src/App.tsx`](file:///home/shailesh/Projects/squizme/apps/client/src/App.tsx), [`apps/client/src/pages/QuizBuilder.tsx`](file:///home/shailesh/Projects/squizme/apps/client/src/pages/QuizBuilder.tsx), [`apps/client/src/pages/QuizPlayer.tsx`](file:///home/shailesh/Projects/squizme/apps/client/src/pages/QuizPlayer.tsx).
- **Caveats**: In Learning Mode, answers lock upon checking to reveal rationale; Exam Mode delays all feedback until final submission.

### 9. Containerization & Deployment
- **Purpose**: Reproducible local and production execution.
- **Implementation**: Multi-stage `Dockerfile` (Node 22 Alpine) compiling frontend and backend into a single image, combined with a `docker-compose.yml` linking the application to a healthy PostgreSQL 16 container.
- **Important Files**: [`Dockerfile`](file:///home/shailesh/Projects/squizme/Dockerfile), [`docker-compose.yml`](file:///home/shailesh/Projects/squizme/docker-compose.yml).
- **Caveats**: Database migrations are synchronized via `drizzle-kit push`.
