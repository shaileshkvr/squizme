# Squizme

Production-oriented, fault-tolerant AI quiz generation platform. Built as a modular TypeScript monorepo powered by Fastify, PostgreSQL, React 19, and Groq inference models.

---

## Architecture Overview

```
squizme/
├── apps/
│   ├── client/                  # React 19 + Vite + Tailwind CSS + shadcn UI (Port 8000)
│   └── server/                  # Fastify API & Asynchronous Job Worker (Port 8001)
│       ├── migrations/          # Transactional SQL migrations (001, 002)
│       ├── src/
│       │   ├── db/              # pg Pool & migration runner
│       │   ├── modules/
│       │   │   ├── generation/  # Asynchronous generator engine & job state machine
│       │   │   ├── quizzes/     # Quiz persistence and retrieval
│       │   │   ├── attempts/    # User attempt evaluation
│       │   │   └── docs/        # Developer documentation portal (/docs)
│       │   ├── plugins/         # Auth stub, CORS, Helmet, Sensible, Swagger
│       │   └── worker.ts        # Standalone background worker process
│       └── tests/               # Vitest unit & PostgreSQL integration test suite
├── packages/
│   └── shared/                  # Shared Zod contracts & TypeScript types
├── docker-compose.yml           # PostgreSQL 16 container definition
└── package.json                 # Monorepo orchestration scripts
```

---

## Core Engine Capabilities

- **Asynchronous Fault-Tolerant Engine**: Long-running quiz generation runs out-of-band via background workers. HTTP calls return `202 Accepted` immediately with a trackable `jobId`.
- **Atomic Concurrency Control**: Worker claiming uses PostgreSQL `FOR UPDATE SKIP LOCKED`. A partial unique index (`uq_one_active_job_per_user`) enforces a single active job per user at the database layer.
- **Multi-Model Inference Pipeline**:
  - **Topic Planning (`qwen/qwen3.8-27b`)**: Rapid curriculum decomposition and topic slot allocation (~25ms latency).
  - **Question Synthesis (`openai/gpt-oss-120b`)**: Deep reasoning model for rigorous question stems, plausible distractors, and verified correctness (~4s per batch).
  - **Explanations (`openai/gpt-oss-20b`)**: Compact reasoning model for feedback and remediation.
- **Deterministic Batch Planning**: Partitions $N$ requested questions into batches of size $\le M$ (default 17) using greedy fill with remainder preservation and exact sum assertions.
- **Self-Healing Validation**: Validates distinct options, single `isCorrect` flags, targeted slot-replacement retries, and a 90% partial acceptance ratio threshold.
- **Cooperative Cancellation**: Heartbeat polling fences expired workers and allows users to halt in-flight jobs gracefully at safe transaction boundaries.

---

## Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0
- **Docker & Docker Compose** (for PostgreSQL)
- **Groq API Key**: For AI question generation

---

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Add your Groq API key to `.env`:
   ```bash
   GROQ_API_KEY=gsk_your_api_key_here
   ```

3. **Start the full stack:**
   ```bash
   pnpm dev:all
   ```
   This command starts the PostgreSQL container, applies migrations, launches the Fastify API server, starts the background worker loop, and spins up the Vite frontend concurrently.

---

## Services & Ports

| Service | Address | Description |
| :--- | :--- | :--- |
| **Frontend Test Bench** | [http://localhost:8000](http://localhost:8000) | React development client (proxies `/api` to port 8001) |
| **Backend API** | [http://localhost:8001](http://localhost:8001) | Fastify REST API |
| **Documentation Portal** | [http://localhost:8001/docs](http://localhost:8001/docs) | Interactive Swagger & Developer Docs Portal |
| **API Health Check** | [http://localhost:8001/health](http://localhost:8001/health) | Server uptime and process status |
| **DB Health Check** | [http://localhost:8001/health/db](http://localhost:8001/health/db) | Live PostgreSQL pool connectivity verification |
| **PostgreSQL** | `localhost:5432` | Container: `squizme-postgres`, DB: `squizme` |

---

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8001` | Fastify HTTP port |
| `HOST` | `0.0.0.0` | Server bind host |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://postgres:rootpassword@localhost:5432/squizme` | PostgreSQL connection string |
| `GROQ_API_KEY` | *(None)* | API key for Groq Cloud inference |
| `GROQ_MODEL_GENERATION` | `openai/gpt-oss-120b` | Model used for batch question synthesis |
| `GROQ_MODEL_PLANNING` | `qwen/qwen3.8-27b` | Model used for curriculum decomposition |
| `GROQ_MODEL_EXPLANATION` | `openai/gpt-oss-20b` | Model used for answer explanations |
| `MAX_BATCH_SIZE` | `17` | Maximum questions requested per AI call |
| `MIN_ACCEPTANCE_RATIO` | `0.9` | Ratio of questions required to complete a job (90%) |
| `LEASE_DURATION_MS` | `300000` | Worker lease TTL (5 minutes) before reclamation |

---

## Available Scripts

```bash
# Orchestration
pnpm dev:all       # Start PostgreSQL container + Server + Worker + Client
pnpm dev           # Start Server + Worker + Client (PostgreSQL already running)
pnpm build         # Build all packages and applications for production
pnpm typecheck     # Run TypeScript verification across all workspaces

# Individual Services
pnpm dev:server    # Run Fastify API server with tsx watch
pnpm dev:worker    # Run standalone background generation worker
pnpm dev:client    # Run Vite client development server (Port 8000)

# Database
pnpm db:up         # Start squizme-postgres container in background
pnpm db:down       # Stop squizme-postgres container

# Testing
pnpm --filter @squizme/server test    # Run all 23 Vitest unit & integration tests
```

---

## Testing & Verification

The test suite covers unit and integration boundaries:
- **Transactional Migrator**: Validates versioned SQL execution and schema consistency.
- **Batch Planner Math**: Verifies greedy fill invariants, remainder allocation, and topic sum constraints.
- **Validation Pipeline**: Verifies option count constraints, non-empty distinct options, and strict single-correct answer enforcement.
- **Job Repository**: Verifies atomic row claiming via `FOR UPDATE SKIP LOCKED`, lease heartbeat renewal, and transactional quiz materialization against a live PostgreSQL instance.
- **API Routes**: Verifies `POST /api/quiz-generations` (202 Accepted), active polling, idempotency conflict detection, and cooperative cancellation.

Run the test suite:
```bash
pnpm --filter @squizme/server test
```
