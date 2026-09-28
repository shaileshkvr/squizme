# Architectural approaches for Squizme

This document records the chosen architecture and the deferred high-scale architecture for future reference.

## Selected approach: Unified TypeScript monorepo with domain modules

Structure the repository as a `pnpm` workspace with three packages:
- `apps/server`: Fastify, Drizzle ORM, MySQL 8.
- `apps/client`: Vite, React 19, Tailwind CSS, Lucide icons.
- `packages/shared`: Shared Zod validation schemas, TypeScript interfaces, and question definitions.

### Backend module boundaries
The backend follows a modular monolith design with strict domain boundaries:
1. `modules/auth`: User registration, login, bcrypt password hashing, and JWT session verification.
2. `modules/documents`: File upload handling (multipart PDF and DOCX), text extraction via `pdf-parse` and `mammoth`, size limits, and sanitization.
3. `modules/generator`: Gemini 2.5/3.x SDK integration using structured tool/schema calls for question templates (single choice, multi-select, true/false, short answer) and Google Search grounding for research queries.
4. `modules/quizzes`: Quiz CRUD, question management, publishing status, and configuration (time limits, learning mode vs exam mode).
5. `modules/attempts`: Quiz session state, answer submission, automated grading, scoring, and historical analytics.

### Why this is selected
- Shared types and schemas between frontend and backend eliminate drift.
- Fastify provides native JSON schema validation and low overhead.
- No additional message brokers or cache layers are needed during initial deployment.

---

## Future scale approach: Event-driven worker architecture with Redis (BullMQ)

When concurrent quiz generation volume or heavy document sizes start blocking HTTP connections, upgrade to this architecture:
- Fastify API acts as an ingest gateway and enqueues jobs to Redis via BullMQ.
- Dedicated Node.js background workers consume generation jobs, manage Gemini rate limits, parse multi-megabyte PDFs, and persist results to MySQL.
- Server-Sent Events (SSE) or WebSockets notify the React client when generation finishes.

### Trigger criteria for upgrade
- Frequent HTTP timeouts during high-traffic quiz generation.
- Need for fine-grained per-user rate limiting, job retries, and job priority queues.
- Asynchronous batch processing of large multi-chapter textbooks.
