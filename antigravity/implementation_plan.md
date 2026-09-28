# Squizme: AI quiz builder implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Squizme, a modular monolithic AI quiz generation platform supporting PDF/DOCX uploads and prompt-based web-researched topic generation, with strict BYO-API key management, configurable quiz execution modes, and MySQL persistence.

**Architecture:** A TypeScript monorepo managed via `pnpm` workspaces consisting of `apps/server` (Fastify + Drizzle ORM + MySQL 8 + Gemini 2.5 Flash), `apps/client` (React 19 + Vite + Tailwind CSS + Lucide icons), and `packages/shared` (Zod schemas and shared types). Docker containerizes the database and application for production and local development.

**Tech Stack:** Node.js 22, TypeScript 5.8, Fastify 5, Drizzle ORM, MySQL 8, React 19, Vite, Tailwind CSS, Zod, @google/genai, pdf-parse, mammoth, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-28-quiz-builder-design.md](file:///home/shailesh/Projects/squizme/docs/superpowers/specs/2026-09-28-quiz-builder-design.md)

## Global Constraints

- Package manager: strictly `pnpm` (`pnpm -w add`, `pnpm run ...`).
- File upload guardrails: maximum 1 file per generation request, maximum 20MB file size, strictly `.pdf` and `.docx`.
- Quota constraints: default host key allows at most 2 free quiz generations per user and at most 10 questions per quiz. BYO Gemini key allows unlimited generations and up to 50 questions per quiz.
- Key security: custom Gemini API keys are encrypted at rest with AES-256-GCM and never exposed to the client in plain text.
- Documentation rule: every source file created under the project root must have a mirrored documentation file under `docs/<filepath>.md` detailing its purpose, impact of absence, functions/methods, and dependency graph (`@/` relative paths).

---

### Task 1: Monorepo workspace initialization and root configuration
- [ ] Create `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.env.example`, `docker-compose.yml`
- [ ] Create mirrored docs under `docs/`
- [ ] Verify workspace install and commit

### Task 2: Shared package with Zod schemas and TypeScript types
- [ ] Scaffolding and types in `packages/shared`
- [ ] Write schema unit tests
- [ ] Implement schemas and exports
- [ ] Create mirrored docs and commit

### Task 3: Backend database setup and encryption utilities (`apps/server/src/db`)
- [ ] Drizzle ORM schema definitions and pool setup
- [ ] AES-256-GCM encryption tests and implementation
- [ ] Create mirrored docs and commit

### Task 4: Auth and user profile modules (`apps/server/src/modules/auth`, `users`)
- [ ] JWT plugin and auth service/routes
- [ ] User profile and custom API key endpoints
- [ ] Tests and mirrored docs

### Task 5: Document extraction module (`apps/server/src/modules/documents`)
- [ ] 20MB guard, PDF & DOCX text extraction
- [ ] Tests and mirrored docs

### Task 6: Gemini quiz generator engine (`apps/server/src/modules/generator`)
- [ ] Question tool schemas and prompt depth controls
- [ ] Free tier quota enforcement and BYO key resolution
- [ ] Tests and mirrored docs

### Task 7: Quizzes, attempts, and auto-grading modules (`apps/server/src/modules/quizzes`, `attempts`)
- [ ] Quiz storage in transactions
- [ ] Auto-grading logic and scorecard compilation
- [ ] Tests and mirrored docs

### Task 8: Server entry point and HTTP bootstrap (`apps/server/src/index.ts`)
- [ ] Fastify bootstrap, plugins, CORS, multipart, module routes
- [ ] Build test and mirrored docs

### Task 9: Frontend scaffolding and design system (`apps/client`)
- [ ] Vite, React 19, Tailwind CSS, Lucide icons, layout shell, AuthContext, Navbar
- [ ] Mirrored docs and commit

### Task 10: In-app Gemini API key tutorial modal and settings (`apps/client/src/components/ApiKeyModal.tsx`)
- [ ] 3-step walkthrough modal, direct Google AI Studio link, YouTube fallback
- [ ] Auth page and key management

### Task 11: Quiz builder studio with scope warning and depth controls (`apps/client/src/pages/QuizBuilder.tsx`)
- [ ] Topic prompt with web research vs document upload
- [ ] Scope warning banner and depth controls
- [ ] Generation loading states and error handling

### Task 12: Quiz runner and scorecard review (`apps/client/src/pages/QuizPlayer.tsx`, `AttemptReview.tsx`)
- [ ] Learning mode (instant check) vs Exam mode (timer + review)
- [ ] Scorecard gauge and question rationale review
- [ ] Dashboard quiz listing

### Task 13: Containerization and Docker deployment (`Dockerfile`, `docker-compose.yml`)
- [ ] Multi-stage production Dockerfile and compose configuration
- [ ] Container build verification

### Task 14: End-to-end verification and test suite execution
- [ ] Complete test pass across shared and server
- [ ] Complete build across all packages
- [ ] Verify docs mirroring consistency
