# Squizme Backend Architecture and Implementation Design

**Document type:** Backend design specification\
**Status:** Proposed implementation baseline\
**Scope:** Quiz generation jobs, source processing, topic planning,
batch generation, validation, persistence, cancellation, recovery, and
on-demand explanations\
**Primary stack:** TypeScript, Fastify, PostgreSQL (pg pool, raw SQL), Zod, Groq\
**Architecture:** Modular monolith with a PostgreSQL-backed background
worker\
**Audience:** Squizme developers implementing and maintaining the
backend

------------------------------------------------------------------------

## 1. Purpose

This document defines how Squizme's backend should behave, how its
modules should be separated, what data must be persisted, and how
generation should recover from retries, cancellation, worker crashes,
and lost client connections.

It is an implementation specification, not a prompt-writing document.
Exact system prompt text should be maintained separately after the data
contracts and workflow are implemented.

The design builds on the existing AI quiz-generation guide. That guide
remains the detailed reference for question quality, structured output,
answer correctness, source-grounding rules, and prompt-injection
boundaries. This document focuses on the backend system that coordinates
those responsibilities.

## 2. Core design principles

1.  **The model generates content; the application controls workflow.**
    The model does not assign database IDs, change job state, authorize
    users, choose retry limits, or persist records.
2.  **The database is the durable source of truth.** A browser tab, HTTP
    connection, worker process, or in-memory queue is not the source of
    truth for generation progress.
3.  **One generation request creates one persistent job.** Repeated
    delivery of the same request must not create duplicate jobs.
4.  **Batching is deterministic application logic.** The application
    decides exact question counts and topic allocations before asking
    the model to fill those allocations.
5.  **Only validated questions become accepted quiz data.** Model output
    remains provisional until it passes structural and application-level
    validation.
6.  **Persist progress at batch boundaries.** A worker restart should
    not require regenerating already committed batches.
7.  **Design for at-least-once execution.** An external AI request may
    be repeated after a crash. Persistence and job transitions must be
    idempotent even though provider-side execution cannot be guaranteed
    exactly once.
8.  **Cancellation is cooperative and race-safe.** A cancel request
    prevents further work as soon as practical, but cannot guarantee
    that an already-running provider request stops.
9.  **The client observes a job; it does not own the job.** Refreshing,
    closing a tab, or losing connectivity must not cancel generation
    automatically.
10. **Start with a modular monolith.** Do not introduce microservices or
    an external queue before operational evidence requires them.

## 3. Scope and non-goals

### Included

-   Authenticated generation submission.
-   Idempotency and active-job prevention.
-   Persistent job state and progress.
-   Source upload references and text extraction.
-   Topic analysis and question distribution.
-   Deterministic batch planning.
-   Groq batch generation.
-   Zod and business-rule validation.
-   Duplicate prevention and bounded repair retries.
-   Batch persistence and worker recovery.
-   Cancellation.
-   Job status and result retrieval.
-   Explanations generated on demand and cached.
-   Logging, metrics, and testing expectations.

### Not included in the first implementation

-   Microservices.
-   Distributed orchestration platform.
-   Redis solely for job state.
-   Mandatory server-sent events (SSE); polling is sufficient initially.
-   Semantic embeddings for every question comparison.
-   Fully automated proof that every question is pedagogically
    excellent.
-   Generating explanations for every option before the learner requests
    them.
-   A separate table for every prompt or model call.
-   Letting the AI invent persistent IDs or modify database records.

------------------------------------------------------------------------

## 4. Technology and architecture decisions

  -----------------------------------------------------------------------
  Concern                 Decision                Reason
  ----------------------- ----------------------- -----------------------
  Runtime                 TypeScript on Node.js   Consistent with the
                                                  application stack

  HTTP framework          Fastify                 Route validation,
                                                  plugins, and modular
                                                  registration

  Database                PostgreSQL              Durable jobs,
                                                  constraints,
                                                  transactions, and
                                                  relational quiz data

  Data access             Raw `pg` pool with      Direct control over
                          parameterized SQL       transactions, row
                                                  locking, and partial
                                                  indexes without ORM
                                                  abstraction

  Migrations              `node-pg-migrate` or    Versioned SQL files
                          numbered SQL files      replacing the current
                                                  DDL bootstrap

  Runtime validation      Zod                     Validate requests,
                                                  model outputs, and
                                                  internal contracts

  AI provider             Groq behind a provider  Keep provider details
                          adapter                 out of business logic

  Background work         PostgreSQL-backed       Durable enough for the
                          worker                  initial scale without
                                                  another service

  Client progress         HTTP polling            Simple to implement and
                                                  recover after refresh

  Source files            Temporary upload        Avoid placing large
                          storage, currently      source files directly
                          intended to use         in relational rows
                          Cloudinary              

  Persistent identifiers  Generated by the        Never trust
                          application/database    model-generated IDs
  -----------------------------------------------------------------------

The project uses raw `pg` (node-postgres) for database access. An ORM is
not required. The job architecture benefits from direct SQL control for
`FOR UPDATE SKIP LOCKED`, partial indexes, and conditional state
transitions.

### 4.1 Modular monolith

The HTTP API and worker may run in the same deployment artifact, but
their responsibilities must be separate. They can initially run as
separate processes using the same codebase and database:

-   **API process:** accepts requests, authorizes access, creates jobs,
    serves status, cancellation, and results.
-   **Worker process:** claims queued jobs, performs generation,
    persists progress, and recovers abandoned work.

Running separate processes is preferable once the worker performs
long-running operations. It prevents AI calls from tying up request
handlers and allows worker capacity to be adjusted independently. Both
processes still belong to the same modular monolith.

### 4.2 High-level flow

1.  Client submits a generation request with an idempotency key.
2.  API authenticates the user and validates the request.
3.  API atomically creates a job or returns the existing job for that
    key.
4.  Worker claims the job from PostgreSQL.
5.  Worker prepares the source context.
6.  Worker creates and persists a topic plan.
7.  Worker generates and validates batches.
8.  Worker commits accepted questions and batch progress
    transactionally.
9.  Client polls job status and retrieves available results.
10. Worker marks the job completed only when all required questions are
    committed.
11. A separate explanation request generates and caches an explanation
    when needed.

### 4.3 AI model configuration

Groq model and generation parameters are server-side configuration,
not client-controlled.

Recommended defaults:

``` typescript
const AI_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
  responseFormat: { type: 'json_object' } as const,
} as const;
```

Store the model name and generation parameters in environment
variables so they can be changed without redeployment. Use Groq's
JSON mode (`response_format: { type: 'json_object' }`) for all
structured output requests. If the selected model does not support
JSON mode, fall back to prompt-based JSON instruction with stricter
output validation.

### 4.4 Environment configuration

All configurable values introduced by this design must have
environment variables with sensible defaults. Add them to the
existing Zod-validated `env.ts`:

``` typescript
// AI
GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
GROQ_TEMPERATURE: z.coerce.number().default(0.7),
GROQ_MAX_TOKENS: z.coerce.number().default(4096),

// Worker
WORKER_POLL_INTERVAL_MS: z.coerce.number().default(5000),
HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
LEASE_DURATION_MS: z.coerce.number().default(300000),
STALE_RECOVERY_INTERVAL_MS: z.coerce.number().default(60000),
MAX_INFRASTRUCTURE_RETRIES: z.coerce.number().default(3),

// Generation
MAX_BATCH_SIZE: z.coerce.number().default(17),
MAX_CONTENT_RETRIES: z.coerce.number().default(2),
MIN_ACCEPTANCE_RATIO: z.coerce.number().default(0.9),
MAX_QUESTION_COUNT: z.coerce.number().default(100),
MAX_PROMPT_LENGTH: z.coerce.number().default(5000),
```

------------------------------------------------------------------------

## 5. Server folder structure

The structure below is the intended target. Create files when their
responsibility is implemented; do not create empty abstractions just to
match a diagram.

``` text
apps/server/
├── migrations/
│   └── 001_initial.sql
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── worker.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── ai.config.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   ├── plugins/
│   │   ├── auth.plugin.ts
│   │   └── error-handler.plugin.ts
│   ├── modules/
│   │   ├── generation/
│   │   │   ├── generation.routes.ts
│   │   │   ├── generation.controller.ts
│   │   │   ├── generation.service.ts
│   │   │   ├── generation.repository.ts
│   │   │   ├── jobs/
│   │   │   │   ├── job.service.ts
│   │   │   │   ├── job.repository.ts
│   │   │   │   ├── job.worker.ts
│   │   │   │   ├── job.scheduler.ts
│   │   │   │   └── job.state.ts
│   │   │   ├── sources/
│   │   │   │   ├── source.service.ts
│   │   │   │   └── extract-text.ts
│   │   │   ├── planning/
│   │   │   │   ├── topic-analyzer.ts
│   │   │   │   ├── distribution.ts
│   │   │   │   └── batch-planner.ts
│   │   │   ├── question-generation/
│   │   │   │   ├── generate-batch.ts
│   │   │   │   ├── generation-prompts.ts
│   │   │   │   ├── retry.ts
│   │   │   │   └── duplicate-check.ts
│   │   │   └── validation/
│   │   │       ├── validate-plan.ts
│   │   │       ├── validate-question.ts
│   │   │       └── validate-batch.ts
│   │   ├── quizzes/
│   │   │   ├── quiz.routes.ts
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── quiz.repository.ts
│   │   └── explanations/
│   │       ├── explanation.routes.ts
│   │       ├── explanation.controller.ts
│   │       ├── explanation.service.ts
│   │       └── explanation-prompts.ts
│   ├── integrations/
│   │   └── groq/
│   │       ├── groq.client.ts
│   │       └── groq.errors.ts
│   └── utils/
│       ├── ids.ts
│       └── time.ts
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

### Module responsibilities

-   `routes`: URL definitions, transport schemas, and handler
    registration.
-   `controller`: translate HTTP requests into service calls and service
    outcomes into HTTP responses. Keep business logic out.
-   `service`: application use cases and orchestration.
-   `repository`: parameterized SQL reads/writes, transaction
    boundaries, conditional updates, and database-specific queries.
-   `jobs`: persistent lifecycle, claiming, recovery, and worker
    coordination.
-   `planning`: topic analysis contract, distribution validation, and
    deterministic batch allocation.
-   `question-generation`: generation context, model calls, and bounded
    repair attempts.
-   `validation`: structural and application-level checks.
-   `sources`: upload-reference validation, text extraction, source
    lifecycle, and cleanup.
-   `integrations/groq`: provider-specific API calls, response parsing,
    timeout handling, and provider error classification.
-   `explanations`: on-demand explanation generation and caching.

`app.ts` constructs Fastify and registers plugins/routes. `server.ts`
starts the HTTP listener. `worker.ts` starts the background worker loop.
Do not make the worker call its own HTTP endpoints to reuse logic; call
application services directly.

`job.scheduler.ts` is optional if the initial worker loop already claims
queued jobs. Keep it only if it has a distinct role such as lease
recovery or scheduled maintenance.

------------------------------------------------------------------------

## 6. Shared contracts and naming

Reusable request, response, question, option, enum, and job-status
schemas belong in `apps/shared`. Server-only internal contracts can stay
in `apps/server`.

Use one canonical spelling for each field across client, shared package,
server, and persisted data. Avoid inconsistent alternatives such as
`numberOfQuestions`, `questionCount`, and `count` for the same concept
in different layers.

Recommended vocabulary:

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  Generation request                  The user's requested quiz settings

  Generation job                      Durable record representing the
                                      entire asynchronous operation

  Topic plan                          Planned topics and required
                                      question counts

  Batch plan                          Deterministic grouping of planned
                                      question slots

  Batch attempt                       One provider attempt to produce a
                                      batch or replacement questions

  Accepted question                   A question that passed required
                                      validation and was committed

  Explanation                         On-demand response explaining an
                                      answer

  Idempotency key                     Client-generated key identifying
                                      one submission attempt

  Lease                               Temporary claim held by a worker
                                      while it processes a job

  Heartbeat                           Periodic update proving that a
                                      worker still owns active work
  -----------------------------------------------------------------------

The AI should receive simple generation context rather than database
bookkeeping. Internal job IDs, batch numbers, lease tokens, and
persistent question IDs are application concerns and generally should
not be included in model input.

------------------------------------------------------------------------

## 7. Persistent data model

The project uses raw PostgreSQL with parameterized queries (`pg` pool)
and versioned SQL migrations. The entities below describe required
responsibilities, not a demand to duplicate existing tables. New tables
are added through migration files; existing tables (`quizzes`, `attempts`)
are preserved.

### 7.1 GenerationJob

One row per generation operation.

Required conceptual fields:

-   `id`: application-generated unique ID.
-   `userId`: owner.
-   `idempotencyKey`: key supplied for this submission.
-   `requestHash`: hash of the normalized request to detect key reuse
    with different input.
-   `status`: current lifecycle state.
-   `requestSnapshot`: validated request settings required for recovery.
-   `sourceId`: optional reference to source material.
-   `plannedQuestionCount`: requested count after validation.
-   `acceptedQuestionCount`: number of committed questions.
-   `completedBatchCount` and `totalBatchCount`: progress metadata.
-   `plan`: persisted topic allocation after planning succeeds.
-   `lastErrorCode`: stable internal error classification, when
    relevant.
-   `attemptCount`: infrastructure/worker execution attempts, distinct
    from model repair attempts.
-   `leaseOwner`, `leaseExpiresAt`, `heartbeatAt`: worker ownership and
    recovery metadata.
-   `cancelRequestedAt`: when cancellation was requested, if represented
    separately from status.
-   `createdAt`, `updatedAt`, `startedAt`, `completedAt`.

Do not store API keys, raw authorization headers, or other secrets in
the job snapshot. Decide whether the original prompt and extracted
source text must be retained, and apply a retention policy.

``` sql
CREATE TYPE generation_job_status AS ENUM (
  'queued', 'planning', 'generating', 'finalizing',
  'cancel_requested', 'cancelled', 'completed', 'failed'
);

CREATE TABLE generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  request_hash    VARCHAR(64) NOT NULL,
  status          generation_job_status NOT NULL DEFAULT 'queued',
  request_snapshot JSONB NOT NULL,
  source_id       UUID,
  planned_question_count  INTEGER NOT NULL,
  accepted_question_count INTEGER NOT NULL DEFAULT 0,
  completed_batch_count   INTEGER NOT NULL DEFAULT 0,
  total_batch_count       INTEGER NOT NULL DEFAULT 0,
  plan            JSONB,
  last_error_code VARCHAR(64),
  attempt_count   INTEGER NOT NULL DEFAULT 0,
  lease_owner     VARCHAR(128),
  lease_expires_at TIMESTAMPTZ,
  heartbeat_at    TIMESTAMPTZ,
  cancel_requested_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  CONSTRAINT uq_user_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX idx_gen_jobs_user_status
  ON generation_jobs (user_id, status)
  WHERE status NOT IN ('completed', 'cancelled', 'failed');

CREATE INDEX idx_gen_jobs_queued
  ON generation_jobs (created_at)
  WHERE status = 'queued';

CREATE INDEX idx_gen_jobs_stale_lease
  ON generation_jobs (lease_expires_at)
  WHERE status IN ('planning', 'generating', 'finalizing')
    AND lease_expires_at IS NOT NULL;
```

### 7.2 GenerationJobBatch

A batch table is recommended for reliable per-batch recovery and
diagnostics.

Conceptual fields:

-   `id`: internal batch record ID.
-   `jobId`: parent job.
-   `batchNumber`: stable ordering within the job.
-   `status`: pending, generating, validating, completed, or failed.
-   `plannedQuestionCount`.
-   `acceptedQuestionCount`.
-   `attemptCount`: number of generation attempts for this batch.
-   `topicAllocation`: topic names and question counts assigned to this
    batch.
-   `lastErrorCode` and safe diagnostic metadata.
-   `startedAt`, `completedAt`, timestamps.

Enforce uniqueness for `(jobId, batchNumber)`. This ID exists for
internal bookkeeping. The AI does not need to see it.

If the current application is very small, batch state could initially
live inside the job's JSON field. A dedicated table is clearer for
independent retries, recovery, and observability; prefer it before
implementing robust resumability.

``` sql
CREATE TABLE generation_job_batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES generation_jobs(id)
                    ON DELETE CASCADE,
  batch_number    INTEGER NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  planned_question_count  INTEGER NOT NULL,
  accepted_question_count INTEGER NOT NULL DEFAULT 0,
  attempt_count   INTEGER NOT NULL DEFAULT 0,
  topic_allocation JSONB NOT NULL,
  last_error_code VARCHAR(64),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  CONSTRAINT uq_job_batch UNIQUE (job_id, batch_number)
);
```

### 7.3 Quiz and question records

Use existing quiz/question/option tables if they already serve this
purpose. A generation job should eventually reference the resulting
quiz.

Persist only accepted questions. Each question should have
application-generated identifiers, stable ordering, its primary topic,
optional secondary topic tags, difficulty, and its validated content.
Options should retain a stable correctness representation.

The existing question contract uses a correctness boolean on each option
(`isCorrect`). Preserve that contract as the current shared schema.
For single-select questions, the backend must enforce exactly one option
marked `isCorrect`.

The current `quizzes` table stores questions as a JSONB column. This is
acceptable for quiz content that is always read and written as a unit.
Generation output tables (`generation_jobs`, `generation_job_batches`)
should use dedicated relational columns. If the product later requires
per-question relational queries (filtering, analytics, cross-quiz
deduplication), migrate the JSONB `questions` column into normalized
`questions` and `question_options` tables.

Never let the model assign persistent database IDs. Assign IDs after the
content passes validation, within the transaction that commits accepted
questions.

### 7.4 Explanation cache

Store generated explanations separately from the authoritative answer
key. A cache record should be keyed by question identity plus a version
or context hash that changes when the question, correct answer, source
evidence, or explanation policy changes.

The answer key is authoritative quiz data. The explanation is generated
supplementary content and must never overwrite the key.

### 7.5 Database constraints

At minimum, enforce:

-   Foreign keys and user ownership relationships.
-   Unique idempotency key per user (or equivalent scope).
-   Unique `(jobId, batchNumber)`.
-   Unique question ordering within a quiz.
-   Unique option ordering within a question.
-   Unique cache key for an explanation version.
-   Appropriate indexes for active jobs, queued jobs, ownership lookups,
    and stale leases.

A partial unique index for one active generation job per user is
recommended. Since the project uses raw SQL migrations, partial indexes
are straightforward:

``` sql
CREATE UNIQUE INDEX uq_one_active_job_per_user
  ON generation_jobs (user_id)
  WHERE status NOT IN ('completed', 'cancelled', 'failed');
```

An application check alone is not enough to prevent concurrent
submissions. Use a database constraint or a transaction/locking strategy
that makes the check atomic.

------------------------------------------------------------------------

## 8. Job states and legal transitions

Use an explicit state machine. Do not combine several booleans into
ambiguous combinations such as `isGenerating = true`,
`isCancelled = true`, and `isComplete = true`.

Recommended states:

  -----------------------------------------------------------------------
  State                   Meaning                 Terminal?
  ----------------------- ----------------------- -----------------------
  `queued`                Persisted and waiting   No
                          for a worker            

  `planning`              Preparing source        No
                          context and topic       
                          allocation              

  `generating`            Generating, validating, No
                          and committing batches  

  `finalizing`            All required questions  No
                          have been accepted;     
                          final consistency       
                          checks and completion   
                          commit are running      

  `cancel_requested`      Cancellation was        No
                          requested; worker must  
                          stop at a safe          
                          checkpoint              

  `cancelled`             Cancellation was        Yes
                          acknowledged and no     
                          more results will be    
                          committed               

  `completed`             All required questions  Yes
                          are committed and the   
                          quiz is ready           

  `failed`                The operation cannot    Yes
                          continue under the      
                          retry policy            
  -----------------------------------------------------------------------

If the product later supports intentionally usable incomplete quizzes,
add an explicit `partial` state with documented UI semantics. Do not use
`completed` for a quiz with fewer questions than promised.

### Allowed transitions

-   `queued` → `planning`, `cancel_requested`, or `failed`.
-   `planning` → `generating`, `cancel_requested`, or `failed`.
-   `generating` → `finalizing`, `cancel_requested`, or `failed`.
-   `finalizing` → `completed`, `cancel_requested` if cancellation is
    still permitted, or `failed`.
-   `cancel_requested` → `cancelled`; it may transition to `completed`
    only if completion had already atomically won the race before
    cancellation was accepted.
-   Terminal states do not transition back to active states. A new
    attempt creates a new job.

All transitions must be guarded by current state. Use conditional
updates or transactions so two concurrent processes cannot both win an
incompatible transition.

### Final-batch cancellation policy

The UI may disable cancellation when the job reaches `finalizing`,
matching the intended experience. This is a UX rule, not a correctness
guarantee. The backend must still reject or safely resolve a
cancellation request that arrives during the transition.

A cancellation request and final completion can race. Define a single
database-level winner: - If cancellation is recorded first while
cancellation is allowed, completion must not commit afterward. - If
completion commits first, the cancellation endpoint returns the already
completed state. - Never report `cancelled` while simultaneously
committing new accepted results after the cancellation boundary.

------------------------------------------------------------------------

## 9. Idempotent submission

### 9.1 Client behavior

When the user begins a new generation attempt, the client creates an
idempotency key and sends it with the submission. If the request times
out or the response is lost, the client retries with the **same** key.

The client must create a new key for a genuinely new generation request.
It must not generate a new key for every transport retry.

### 9.2 Server behavior

1.  Authenticate the user.
2.  Validate and normalize the request.
3.  Compute a stable request hash from the meaningful request fields.
4.  In a transaction, look up or create the job using the user's
    idempotency scope.
5.  If the key exists and the request hash matches, return the existing
    job.
6.  If the key exists but the request hash differs, return a conflict
    error.
7.  If a different active job already exists for the user, return that
    active job or a stable `ACTIVE_GENERATION_EXISTS` response according
    to the API contract.
8.  Commit the new job before acknowledging acceptance.

The request hash should use normalized semantic fields, not arbitrary
JSON key order. Include the prompt, source reference/version, mode,
difficulty, question count, and any other field that changes generated
output. Exclude transient transport metadata.

### Request hash algorithm

Compute the hash as SHA-256 of a canonicalized JSON string:

``` typescript
import { createHash } from 'node:crypto';

function computeRequestHash(input: {
  prompt: string;
  sourceId?: string;
  mode: string;
  difficulty: string;
  questionCount: number;
}): string {
  const canonical = JSON.stringify({
    difficulty: input.difficulty,
    mode: input.mode,
    prompt: input.prompt.trim(),
    questionCount: input.questionCount,
    sourceId: input.sourceId ?? null,
  });
  return createHash('sha256').update(canonical).digest('hex');
}
```

Keys are sorted alphabetically. The prompt is trimmed but not
lowercased (case may affect generation). The hash changes when any
meaningful generation input changes.

### 9.3 Idempotency is not exactly-once provider execution

A worker can send a Groq request, receive a response, and crash before
persisting the result. On recovery, the application may need to call the
provider again.

The guarantee is therefore: - Duplicate client submissions do not create
duplicate jobs. - Already committed batches are not committed twice. -
Retries do not duplicate accepted question records. - A provider request
that finished but whose result was never durably recorded may be
repeated.

Do not promise exactly-once AI execution.

------------------------------------------------------------------------

## 10. Worker claiming, leases, and recovery

The worker must not rely on an in-memory queue as the only record of
pending work.

### 10.1 Claiming a job

The worker claims a queued job atomically. PostgreSQL row locking, such
as `FOR UPDATE SKIP LOCKED`, is a suitable approach when multiple worker
processes may run. Use parameterized raw SQL for claiming, conditional
updates, and partial-index behavior. Direct `pg` pool access makes this
straightforward.

Claiming must:

-   Select a job that is eligible for processing.
-   Atomically mark it as claimed/active and assign a lease.
-   Prevent two workers from processing the same job concurrently.
-   Commit the claim before doing slow network work.

Never hold a database transaction open while waiting for Groq. Long
external calls must occur outside database transactions.

### 10.2 Lease and heartbeat

The worker periodically updates a heartbeat and lease expiry while it
owns a job. The lease duration must comfortably exceed normal heartbeat
delays and be configurable.

If a worker crashes or loses database access, its lease eventually
expires. A recovery loop can then determine whether the job is eligible
for resumption.

A lease is not a substitute for conditional writes. Every progress
update and commit should verify that the worker still owns the job, or
use a fencing/version mechanism that prevents an expired worker from
writing after a replacement worker takes over.

### Recommended defaults

-   Heartbeat interval: 30 seconds.
-   Lease duration: 5 minutes.
-   Stale recovery scan interval: 60 seconds.
-   Maximum infrastructure retry attempts: 3.
-   Worker poll interval for new jobs: 5 seconds.

Store these as environment variables with sensible defaults.

### 10.3 Recovery rules

On startup and periodically:

1.  Find queued jobs and expired active leases.
2.  Determine whether the job is resumable.
3.  Requeue or reclaim eligible work transactionally.
4.  Resume from persisted plan and batch state.
5.  Never reset already committed batches.
6.  Fail or quarantine jobs that exceed the infrastructure retry
    policy.

Persist the topic plan before batch generation. Persist each accepted
batch before advancing to the next batch. These boundaries define what
recovery can safely skip.

Infrastructure retry count and model content-repair attempts are
separate counters and must not be conflated.

------------------------------------------------------------------------

## 11. Source material lifecycle

The generation request may contain no source or a reference to uploaded
material.

### Without source material

The planner and generator use the user's prompt and permitted general
knowledge. The request contract must define whether vague prompts are
accepted, clarified, or rejected. The model must not claim that content
came from a document when none was supplied.

### With source material

1.  Validate that the source belongs to the authenticated user and is
    eligible for use.
2.  Verify upload status, allowed MIME type, size, and source
    availability.
3.  Extract text using a format-specific extractor.
4.  Detect empty, corrupted, or unusable extraction results.
5.  Normalize extracted text while preserving meaningful structure.
6.  Store or reference the prepared context needed by later batches.
7.  Mark extraction state so a retry does not needlessly repeat
    expensive work.
8.  Remove temporary files only after no active generation operation
    depends on them and retention policy permits deletion.

Scanned documents may require OCR. Do not treat empty text extraction as
a successful source-processing result.

### Source security

Uploaded content is untrusted data. Text inside a PDF must never
override system instructions, change the output schema, authorize tools,
or control the backend. Delimit source content clearly in model context
and retain application-side validation.

Limit extraction size and processing time. Treat archive bombs,
malformed files, and unsupported types as source-processing failures. Do
not expose arbitrary remote URLs to server-side fetchers without SSRF
controls.

### Retention

The temporary source should be deleted when the worker no longer needs
it, not immediately after the first extraction if later batches still
require the text. Persist only the minimal source evidence or context
required for future explanation requests. Define cleanup for abandoned
uploads and failed jobs.

------------------------------------------------------------------------

## 12. Topic analysis and question distribution

Topic analysis is an AI-assisted planning step. Count enforcement is
deterministic application logic.

### 12.1 Planner input

The planner receives:

-   User prompt.
-   Selected mode.
-   Difficulty.
-   Requested question count.
-   Source text or prepared source context, if present.
-   Product constraints such as supported question types and maximum
    batch size.

### 12.2 Planner output

The planner returns a structured topic plan. Each topic has a stable
name within the plan and an integer question allocation. It may also
contain subtopics, learning targets, source references, and difficulty
guidance if the shared contract requires them.

The model must not decide persistent IDs or batch execution state.

### Topic plan contract

``` typescript
const TopicAllocationSchema = z.object({
  name: z.string().min(1),
  questionCount: z.number().int().positive(),
  subtopics: z.array(z.string()).optional(),
  difficultyHint: z.enum(['easy', 'medium', 'hard']).optional(),
});

const TopicPlanSchema = z.object({
  topics: z.array(TopicAllocationSchema).min(1),
  totalQuestionCount: z.number().int().positive(),
});
```

The schema belongs in the shared package. The model returns this
structure; the application validates it before proceeding to batch
planning.

### 12.3 Plan validation

The application checks:

-   Every topic has a non-empty name.
-   Every allocation is a positive integer, unless zero allocations
    are explicitly supported.
-   The sum of all allocations equals the requested question count
    exactly.
-   Topic names are normalized and not accidental duplicates.
-   The plan remains within the user's requested scope.
-   Any difficulty distribution or question-type counts sum correctly.
-   The plan is feasible given source material and product limits.

If the sum is wrong, return deterministic validation feedback to the
planner within a bounded retry policy. If the plan remains invalid, fail
the job instead of silently changing the requested total.

### 12.4 Deterministic distribution

The model may suggest topic weights or counts. The server enforces all
invariants. If the planner returns weights rather than final counts,
application code converts them into integer counts using a deterministic
allocation method and verifies the final sum.

Keep planning and allocation separate: AI can help identify what
deserves coverage; code guarantees arithmetic.

------------------------------------------------------------------------

## 13. Deterministic batch planning

Batch planning must not depend on model judgment.

Given: - Total requested question count `N`. - Maximum batch size `M`. -
Topic allocations whose sum is `N`.

The scheduler divides the total into batches no larger than `M`, with
balanced sizes where practical. For example, 50 questions with a maximum
of 17 can become 17, 17, and 16.

### 13.1 Topic slots

The application maps topic allocations onto batch slots in a
deterministic order. A topic can span more than one batch. The scheduler
knows this because it tracks the number of slots assigned to each topic,
not because the model reports topic boundaries.

For each batch, persist: - Batch number. - Planned total question
count. - Per-topic question counts. - Batch state and attempt count.

The batch plan must satisfy:

-   Sum of batch question counts equals `N`.
-   No batch exceeds `M`.
-   Sum of allocations for each topic across all batches equals that
    topic's planned count.
-   Every planned slot belongs to exactly one batch.
-   Re-running the planner from the same persisted plan produces the
    same allocations.

### 13.2 Batch planning algorithm

Use greedy fill:

1.  Compute batch count: `B = ceil(N / M)`.
2.  Compute base batch size: `base = floor(N / B)`.
3.  Compute remainder: `r = N mod B`. The first `r` batches have
    `base + 1` questions; the remaining `B - r` batches have `base`.
4.  Sort topics by allocation descending.
5.  For each topic, fill the current batch until its capacity is
    reached, then continue to the next batch.
6.  Assert: sum of all batch counts equals `N`, no batch exceeds `M`,
    and each topic's total allocation across batches equals its
    planned count.

### 13.3 Keep model input simple

Do not send internal batch IDs or database job IDs to the model unless a
specific feature requires them. The generation request context can
contain:

-   `topics`: topics covered by this batch.
-   `previousQuestions`: raw text of accepted questions relevant to
    those topics.
-   `questionGeneration`: topic names and number of new questions
    required for each.
-   `difficulty`.
-   `mode`.
-   Source context.
-   Required question format and other constraints.

The actual shared contract defines the exact field names. Pick canonical
names and use them consistently.

### 13.4 Topic ownership on questions

Every accepted question must be associated with a primary topic by
application logic. The generator can return the topic name for each
question or the server can assign topic ownership by generating each
topic section separately.

If a batch contains multiple topics, structured question objects with a
topic field are safer than an unlabelled raw string array. Secondary
topic tags may be supported, but a question counts toward exactly one
primary planned slot unless the product explicitly defines a different
accounting rule.

Topic names are sufficient for the AI context. Internal stable topic IDs
are optional; add them only if database relationships or evolving topic
identity make them useful.

------------------------------------------------------------------------

## 14. Batch generation and duplicate prevention

### 14.1 Generation context

For each batch, construct context from: - The generation system
prompt. - Original user intent and settings. - Source text or relevant
source excerpts. - Current batch topic allocation and exact count. -
Previous accepted question text from relevant topics. - Validation
feedback, if this is a repair attempt.

Do not send every previous question from the entire quiz by default.
Select previous questions whose primary topic matches the current batch
topics. For large topics, add retrieval or truncation later if prompt
size becomes a problem.

Send question text only for duplicate avoidance unless options or
explanations are specifically needed for a validation task. This reduces
token usage and distracts the generator less.

### 14.2 Duplicate layers

Start with: 1. Prompt-level instruction not to repeat previously tested
concepts. 2. Normalized text/hash comparison for exact duplicates. 3.
Deterministic checks for duplicate options and duplicate question text.

Semantic similarity may be added later through embeddings or a separate
evaluator if observed failures justify the cost. Similarity alone must
not automatically reject related questions: two questions about the same
topic can test different learning targets.

### 14.3 Partial acceptance and replacement

If a batch returns 17 questions and 15 pass required validation, keep
the 15 accepted questions as provisional batch results only if the
persistence model can safely represent incomplete batches. Request
replacements for the two rejected slots, supplying their topic
allocation and deterministic error feedback.

Do not regenerate accepted questions just because two failed. However,
do not mark the batch complete until its exact required count has been
accepted.

A simpler first implementation may validate the whole batch before
committing it. If any question fails, retry the entire batch up to the
configured limit. This is easier but can waste valid output and tokens.
Choose one policy explicitly; the recommended target is targeted
replacement with clear slot accounting.

### 14.5 Partial completion threshold

If all replacement attempts for a batch are exhausted and the batch
still has fewer accepted questions than planned, the application must
decide whether to fail the job or accept a partial result.

Recommended policy: accept the job as completed if the total accepted
question count is at least 90% of the planned count and all topics
have at least one accepted question. Otherwise, fail the job.

This threshold must be configurable (`MIN_ACCEPTANCE_RATIO`,
default `0.9`). If the product later supports an explicit `partial`
job state, use that instead of `completed` for below-target results.

### 14.4 Model prompt variants

Maintain a small number of core prompts: 1. Topic analysis and
distribution. 2. Batch question generation. 3. On-demand explanation
generation.

Use request context to distinguish a batch with no relevant prior
questions from one with previous questions. Reuse the relevant system
prompt for repair attempts, adding the previous output and structured
validation errors. Do not create a completely separate prompt for every
retry scenario.

------------------------------------------------------------------------

## 15. Validation pipeline

Treat validation as several independent layers.

### 15.1 Transport/provider validation

Check that:

-   The provider request succeeded.
-   A response exists and is not truncated.
-   The expected structured-output field exists.
-   The response can be parsed.
-   Provider refusal or incomplete output is handled explicitly.

Classify network, rate-limit, timeout, and provider errors separately
from content errors.

### 15.2 Schema validation

Use the shared Zod schema at the server boundary even if Groq structured
output is enabled. Strict provider schemas reduce structural failures;
they do not replace runtime validation.

Reject unexpected fields where appropriate. Keep the provider's JSON
Schema compatible with the selected model's supported subset, and do not
assume every Zod feature can be expressed identically in provider schema
mode.

The project does not use Prisma. Validation boundaries are enforced
through Zod schemas in the shared package and parameterized SQL
queries on the server.

### 15.3 Deterministic business validation

Check:

-   Exact batch count.
-   Exact topic counts per batch.
-   Non-empty question text.
-   Supported question type.
-   Required option count.
-   Non-empty, distinct options.
-   Exactly one correct option for single-select questions.
-   Correctness representation references actual options.
-   Required hint or feedback fields exist if the selected contract
    requires them.
-   No duplicate generated IDs where IDs are included in
    application-owned objects.
-   No duplicate question text within the batch or against accepted
    history.
-   The batch does not exceed the remaining topic allocation.
-   No question is accepted twice after a retry or worker recovery.

If the current question schema uses an `isCorrect` boolean per option,
count the true values in application code. Never silently select one if
multiple options are marked true.

### 15.4 Semantic/content validation

Checks may include: - Question is within the requested topic and source
scope. - Exactly one answer is defensible. - Distractors are plausible
but incorrect. - The answer key agrees with the question. - The question
does not reveal its own answer. - Difficulty matches the requested
cognitive demand. - The question tests a distinct learning target. -
Source-grounded claims are supported by the source. - Feedback, if
generated in advance, agrees with the answer key.

Not every semantic property can be proven deterministically. Start with
strong structural invariants and add evaluators only where their
measured benefit justifies the extra cost and latency.

### 15.5 Retry policy

Separate these failure classes:

  -----------------------------------------------------------------------
  Failure                             Action
  ----------------------------------- -----------------------------------
  Malformed or truncated model output Retry if the cause is transient or
                                      repairable

  Structural schema failure           Bounded repair with validation
                                      feedback

  Invalid answer key or duplicate     Replace rejected questions or retry
  question                            batch according to the chosen
                                      policy

  Topic/count mismatch                Repair with explicit expected
                                      allocations

  Rate limit or transient provider    Backoff and retry within
  outage                              infrastructure policy

  Invalid API key/configuration       Fail fast; do not ask the model to
                                      fix it

  Database outage                     Stop commits, preserve job state,
                                      and allow infrastructure recovery

  Source extraction failure           Fail source preparation or request
                                      a usable source; do not invent
                                      source contents
  -----------------------------------------------------------------------

For content repair, allow a configured initial attempt plus a small
number of retries (the existing AI guide suggests two retries, three
total attempts). Keep the limit configurable. Never use an unlimited
loop.

Store internal error categories and attempt counts. Do not expose raw
prompts, provider errors, or detailed validator output to ordinary
users.

------------------------------------------------------------------------

## 16. Atomic persistence and batch completion

A batch is not complete merely because the model returned JSON.

The commit procedure should: 1. Confirm the worker still owns the job
and cancellation has not won. 2. Validate the exact remaining count and
topic allocation. 3. Assign application-owned question and option IDs.
4. Persist accepted questions and options in a database transaction. 5.
Update batch accepted count and status. 6. Update job accepted count and
progress metadata. 7. Commit the transaction.

The accepted question rows and corresponding batch/job progress must be
committed atomically. If the transaction fails, none of those updates
should be visible as completed work.

Use a uniqueness strategy to prevent the same batch result or question
slot from being inserted twice. A retry should detect previously
committed work and reuse it rather than inserting another copy.

Do not hold a transaction open during Groq calls, file extraction, or
other network operations.

### Batch finalization invariant

A batch may be marked completed only when: - Its accepted count equals
its planned count. - Every accepted question has passed required
validation. - The persisted question rows exist. - The job's progress
update is committed.

The job may be marked completed only when all batches are completed and
the total accepted count equals the requested count.

------------------------------------------------------------------------

## 17. Cancellation mechanism

Cancellation is a persistent state transition, not merely an aborted
browser request.

### Client

-   Send a cancellation request to the backend.
-   Show "Cancellation requested" while waiting for acknowledgement.
-   Do not claim cancellation succeeded until the server reports
    `cancelled` or an already terminal state.
-   Disable the cancel control near finalization if that is the intended
    UX.
-   Preserve the job ID so the user can recover status if the connection
    drops.

### Server

1.  Authenticate and verify ownership.
2.  Atomically transition an eligible active job to `cancel_requested`.
3.  Return the current state.
4.  Worker checks cancellation before each new provider call.
5.  Worker checks again after a provider call and before committing
    results.
6.  Worker stops scheduling further batches and finalizes cancellation.
7.  The job transitions to `cancelled` only after the worker has
    acknowledged the stop boundary.

### In-flight provider request

A Groq request already in progress may continue and may incur cost. If
the HTTP client supports aborting the request, use it where appropriate,
but do not depend on provider-side cancellation for correctness.

Any response that returns after cancellation must not be committed as
new accepted quiz content if the cancellation boundary already won.

### Race with completion

Completion and cancellation must use conditional database updates or
transactions. If finalization commits first, cancellation returns the
completed state. If cancellation wins first while permitted,
finalization must not commit afterward.

------------------------------------------------------------------------

## 18. Job status, progress, and result retrieval

### Recommended endpoints

Use existing route naming conventions if the application already has
them. The following is the proposed API contract:

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  `POST`                  `/api/quiz-generations`                    Submit a new generation
                                                                     request

  `GET`                   `/api/quiz-generations/:jobId`             Retrieve status and
                                                                     progress

  `GET`                   `/api/quiz-generations/active`             Find the current user's
                                                                     active generation

  `POST`                  `/api/quiz-generations/:jobId/cancel`      Request cancellation

  `GET`                   `/api/quizzes/:quizId`                     Retrieve persisted quiz
                                                                     metadata and questions

  `POST`                  `/api/questions/:questionId/explanation`   Request or retrieve an
                                                                     explanation
  ------------------------------------------------------------------------------------------

These endpoints are proposed names, not a claim about the current API.

Note: The existing `POST /api/generator/prompt` endpoint is a
handshake stub that echoes the prompt and checks Groq SDK readiness.
It will be replaced by the `POST /api/quiz-generations` endpoint
defined above. The routing namespace changes from `/generator/` to
`/quiz-generations/`.

### Submission response

Return `202 Accepted` after the job has been durably created. Include
the job ID, status, and a location or retrieval path. If an idempotency
retry finds an existing job, return that job's current state.

### Status response

Expose only user-safe state: - Job ID. - Status. - Planned question
count. - Accepted question count. - Completed/total batches. - Result
quiz ID when available. - Stable user-safe error code/message on
failure. - Timestamps useful for recovery.

Do not expose system prompts, raw source text, private validator
diagnostics, provider credentials, or another user's data.

### Result retrieval

The status endpoint may return a small progress summary. Use a separate
quiz/results endpoint for question content if the response would
otherwise become large.

Authorize every job and quiz lookup against the authenticated owner. A
UUID is not an authorization mechanism.

### Polling

Start with polling at a reasonable interval and back off when the job is
inactive or the page is in the background. Polling should not trigger
new generation work. Add SSE later only if responsiveness or traffic
justifies it.

### Polling defaults

-   Active generation in foreground tab: poll every 2 seconds.
-   Active generation in background tab: poll every 10 seconds.
-   Backoff on repeated identical responses: exponential up to 30
    seconds.
-   Stop polling when the job reaches a terminal state.

### Submission request schema

``` typescript
const GenerationRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  prompt: z.string().trim().min(1).max(5000),
  sourceId: z.string().uuid().optional(),
  mode: z.enum(['learning', 'assessment']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(100),
});
```

### Status response schema

``` typescript
const JobStatusResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: GenerationJobStatusSchema,
  plannedQuestionCount: z.number().int(),
  acceptedQuestionCount: z.number().int(),
  completedBatches: z.number().int(),
  totalBatches: z.number().int(),
  quizId: z.string().uuid().nullable(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

------------------------------------------------------------------------

## 19. Lost connection and client recovery

The browser must treat `jobId` as the reference to an already-submitted
operation.

1.  Save the job ID in appropriate client state and, if needed, session
    storage.
2.  If the submission response is lost, retry with the same idempotency
    key.
3.  On page reload, request the user's active job.
4.  Fetch status and available results.
5.  Resume displaying progress without submitting a new generation
    request.
6.  If the job is terminal, show the result or a recoverable error.
7.  If the job is active, continue polling.

Server-side persistence is authoritative. Client storage is only a
convenience for finding the job again.

Closing a browser tab must not cancel the server-side job by default.

------------------------------------------------------------------------

## 20. On-demand explanations

Explanations are deliberately separate from initial quiz generation to
avoid generating unused explanatory content for every question.

### Request context

The server retrieves the authoritative stored question, options, correct
answer, relevant source evidence, and the learner's selected answer. The
client must not be allowed to override the stored answer key.

### Workflow

1.  Authenticate and authorize access to the quiz/question.
2.  Validate that the selected answer belongs to the question.
3.  Build explanation context from stored question data and relevant
    source evidence.
4.  Check the explanation cache.
5.  If a valid cache entry exists, return it.
6.  Otherwise call the explanation model.
7.  Validate the response for shape, length, and required fields.
8.  Persist the explanation under a versioned cache key.
9.  Return it to the client.

The explanation model must not determine or overwrite the correct
answer. It explains the authoritative key.

### Cache invalidation

A cache entry becomes stale if the question text, options, correct
answer, source evidence, model policy, or explanation prompt version
changes. Use a version or hash that captures relevant changes.

### Retry

Reuse the explanation prompt with structured validation feedback for
repairable content failures. Keep retries bounded. Provider outages and
invalid configuration are infrastructure failures, not
explanation-content repair cases.

------------------------------------------------------------------------

## 21. Temporary source cleanup

Source cleanup must not race with active generation.

The source lifecycle should distinguish:

-   Uploaded.
-   Ready for extraction.
-   Extracting.
-   Extracted/prepared.
-   In use by an active job.
-   Eligible for cleanup.
-   Deleted or expired.

Cleanup can be driven by job completion/failure plus a periodic
stale-upload cleanup task. Before deletion, confirm no active job
depends on the source and that any evidence required for future
explanations has been retained separately.

If source retention fails, do not invalidate already persisted quiz
questions. Record the cleanup failure for later retry without changing a
successfully completed job to failed.

------------------------------------------------------------------------

## 22. Error model

Use stable application error codes. Keep provider-specific codes
internal.

Suggested categories:

-   `INVALID_GENERATION_REQUEST`
-   `IDEMPOTENCY_KEY_REUSED`
-   `ACTIVE_GENERATION_EXISTS`
-   `SOURCE_NOT_FOUND`
-   `SOURCE_NOT_READY`
-   `SOURCE_EXTRACTION_FAILED`
-   `GENERATION_PLAN_INVALID`
-   `QUESTION_GENERATION_FAILED`
-   `QUESTION_VALIDATION_FAILED`
-   `GENERATION_CANCELLED`
-   `GENERATION_NOT_FOUND`
-   `GENERATION_CONFLICT`
-   `AI_PROVIDER_UNAVAILABLE`
-   `INTERNAL_ERROR`

The exact list should match the shared error contract.

Errors should include:

-   Stable code.
-   User-safe message.
-   Optional request/correlation ID.
-   Retryable flag only if the client has a meaningful action to take.

### User-facing error messages

  -----------------------------------------------------------------------
  Internal code                       User-facing message
  ----------------------------------- -----------------------------------
  `INVALID_GENERATION_REQUEST`        "Please check your quiz settings
                                      and try again."

  `ACTIVE_GENERATION_EXISTS`          "You already have a quiz being
                                      generated. Please wait for it to
                                      finish."

  `SOURCE_EXTRACTION_FAILED`          "We couldn't read your uploaded
                                      file. Try a different format."

  `QUESTION_GENERATION_FAILED`        "We couldn't generate enough
                                      quality questions. Try a
                                      different prompt or fewer
                                      questions."

  `GENERATION_CANCELLED`              "Quiz generation was cancelled."

  `AI_PROVIDER_UNAVAILABLE`           "Quiz generation is temporarily
                                      unavailable. Please try again in
                                      a few minutes."

  `INTERNAL_ERROR`                    "Something went wrong. Please try
                                      again later."
  -----------------------------------------------------------------------

Do not expose raw provider error bodies, system prompts, stack traces,
internal SQL errors, or full source content.

------------------------------------------------------------------------

## 23. Security and authorization

-   Every generation job and resulting quiz belongs to an authenticated
    user.
-   Every status, cancel, result, and explanation endpoint verifies
    ownership.
-   Idempotency keys are scoped to the user or another explicitly
    defined security boundary.
-   Source references are checked for ownership before use.
-   Rate-limit job submission and explanation generation.
-   Enforce maximum prompt length, source size, extracted text size,
    question count, and request rate.
-   Keep Groq and upload-provider secrets on the server.
-   Treat uploaded source content and model output as untrusted.
-   Validate model output before persistence or rendering.
-   Avoid logging full prompts, source material, answers, or user data
    unless there is a clear diagnostic need and an appropriate retention
    policy.
-   Do not rely on hidden frontend controls for security.
-   Do not expose raw internal validation failures to end users.

### 23.1 Authentication prerequisite

No authentication system exists in the current codebase. All
endpoints are public. Before implementing any ownership or
authorization check described in this document, an authentication
strategy must be chosen and integrated. The auth mechanism must
provide a verified `userId` on every request that creates, reads,
cancels, or retrieves generation jobs, quizzes, and explanations.

### 23.2 Rate limiting

Use `@fastify/rate-limit` or an equivalent plugin.

Suggested defaults:

-   Job submission: 5 requests per user per hour.
-   Explanation generation: 30 requests per user per minute.
-   Status polling: 60 requests per user per minute.
-   Global fallback: 200 requests per IP per minute.

Store counters in memory initially. Move to Redis or a database
counter if the application runs multiple API processes.

------------------------------------------------------------------------

## 24. Observability

Every job and batch should be traceable through a correlation ID.

Record structured events for: - Job accepted or deduplicated. - Job
claimed, heartbeat updated, recovered, or lease expired. - Source
extraction started/completed/failed. - Topic plan generated and
validated. - Batch attempt started/completed. - Validation failed and
retry started. - Accepted results committed. - Cancellation
requested/acknowledged. - Job completed or failed. - Explanation cache
hit/miss and generation result. - Source cleanup success/failure.

Track metrics: - Job success and final failure rates. - First-attempt
and retry success rates. - Average and percentile generation latency. -
Time to first accepted batch. - Batch retry count. - Validation failures
by category. - Provider errors and rate limits. - Average questions
accepted per batch. - Cancellation request-to-acknowledgement latency. -
Stale lease recovery count. - Token/cost usage where available. -
Explanation cache hit rate.

Do not treat high retry rates as normal. They may indicate a poor
prompt, unsupported schema, incorrect batching, or an unsuitable model.

------------------------------------------------------------------------

## 25. Testing strategy

### Unit tests

Test deterministic logic without calling Groq: - Request normalization
and request hashing. - Batch balancing. - Topic allocation sum checks. -
Topic-to-batch slot mapping. - Previous-question selection by current
topic. - Exact duplicate detection. - Question and batch business
validators. - Legal job-state transitions. - Retry-limit decisions. -
Cancellation decision logic.

### Integration tests

Use a test PostgreSQL database and mocked provider: - Idempotent
repeated submission returns one job. - Same idempotency key with a
different payload is rejected. - Concurrent submissions cannot bypass
active-job protection. - Two workers cannot claim the same job
simultaneously. - Accepted batch and progress commit atomically. - A
committed batch is not duplicated after retry. - A stale worker cannot
write after lease loss. - Cancellation prevents later batches from
starting. - Cancellation racing with finalization has one deterministic
winner. - Job recovery resumes from persisted batch progress. - User A
cannot read or cancel User B's job or quiz. - Explanation cache keys
invalidate after relevant question changes.

### Provider-contract tests

Mock: - Valid structured response. - Malformed/truncated response. -
Wrong question count. - Invalid answer key. - Duplicate question. - Rate
limit. - Timeout. - Provider unavailable. - Cancellation while a call is
in flight.

### End-to-end tests

Cover: - Prompt-only generation. - Source-based generation. - Medium
difficulty and learning mode. - Job progress and first-batch delivery. -
Browser refresh while generating. - Lost submission response and
idempotent retry. - User cancellation. - Worker crash and recovery. -
On-demand explanation and cache hit. - Final failure after bounded
retries.

Do not require real Groq calls in every test suite. Keep deterministic
tests fast and reserve live-provider smoke tests for a controlled
environment.

------------------------------------------------------------------------

## 26. Implementation order

Build the system in this order to reduce rework.

### Phase 0: Prerequisites

1.  Decide and implement the authentication strategy (JWT, session
    cookies, or hosted auth such as Clerk). Stub it during
    development if needed, but ensure the `userId` is available on
    every authenticated request.
2.  Replace the DDL bootstrap in `db/schema.ts` with a versioned
    migration tool (`node-pg-migrate` or equivalent numbered SQL
    files). Migrate existing `quizzes` and `attempts` tables into the
    first migration.
3.  Write the `generation_jobs` and `generation_job_batches` DDL as
    the second migration.
4.  Normalize the existing JSONB `questions` column into dedicated
    `questions` and `question_options` tables if the product requires
    per-question relational queries. If JSONB-in-quiz is sufficient
    for the current product, keep it and normalize only generation
    output tables.

### Phase 1: contracts and persistence

1.  Inspect the existing database schema and shared Zod contracts.
2.  Reuse existing quiz/question tables rather than duplicating them.
3.  Define job and batch states and legal transitions.
4.  Add the minimum job/batch persistence, constraints, and partial indexes via raw migration SQL.
5.  Add migration and integration tests.

### Phase 2: deterministic planning

1.  Validate generation requests.
2.  Define the topic-plan contract.
3.  Implement topic-plan validation.
4.  Implement deterministic distribution and batch allocation.
5.  Test that all topic and batch counts sum exactly.

### Phase 3: batch generation

1.  Implement the Groq adapter.
2.  Implement one batch-generation service.
3.  Build generation context from topics, previous question text,
    counts, difficulty, mode, and source.
4.  Implement schema and business validation.
5.  Implement bounded retry and targeted replacement or explicitly
    chosen whole-batch retry.
6.  Persist accepted batch results transactionally.

### Phase 4: durable jobs

1.  Add idempotent job submission.
2.  Add atomic worker claiming and leases.
3.  Add heartbeat and stale-job recovery.
4.  Add status and result retrieval.
5.  Add safe terminal-state transitions.

### Phase 5: cancellation and client recovery

1.  Implement cancellation endpoint.
2.  Add cancellation checkpoints to the worker.
3.  Make cancellation/finalization race-safe.
4.  Implement active-job lookup and polling.
5.  Recover the job after refresh or lost connection.

### Phase 6: explanations and cleanup

1.  Implement explanation endpoint and cache.
2.  Ensure stored answer keys remain authoritative.
3.  Add safe source cleanup and stale-upload cleanup.
4.  Add operational metrics and structured logging.

### Phase 7: hardening

1.  Run concurrency and recovery tests.
2.  Verify rate limits and size limits.
3.  Test provider outage scenarios.
4.  Review data retention and logging.
5.  Measure retry rates and generation latency before adding semantic
    retrieval or a more complex queue.

------------------------------------------------------------------------

## 27. Acceptance criteria

The backend design is implemented when all of the following are true:

-   Repeating a submission with the same idempotency key cannot create
    another job.
-   Reusing the same key with a different normalized request is
    rejected.
-   A user cannot run concurrent active generation jobs if the product
    policy permits only one.
-   Job state survives API process restarts and client disconnects.
-   The worker can resume without duplicating committed questions.
-   The planner and batch scheduler guarantee exact requested counts.
-   A topic can span batches without losing its remaining-question
    count.
-   The model receives only the relevant prior question text needed for
    duplicate prevention.
-   Invalid output cannot reach accepted quiz tables.
-   Retries are bounded and distinguish content failures from
    infrastructure failures.
-   Accepted batches and progress are committed atomically.
-   Cancellation stops future work at safe checkpoints and is race-safe
    with finalization.
-   The job is marked completed only when the exact requested question
    count is persisted.
-   The client can recover the active job and retrieve results after a
    refresh or lost connection.
-   Explanations are generated only when requested, validated, cached,
    and never allowed to overwrite the answer key.
-   Temporary source material is not deleted while an active job depends
    on it.
-   Authorization and ownership checks protect every job, quiz, source,
    and explanation endpoint.
-   Logs and metrics make retries, provider failures, cancellations, and
    worker recovery diagnosable.

------------------------------------------------------------------------

## 28. Final architectural summary

Squizme's backend should be a modular monolith with two execution paths:
a request/response API and a durable background worker. PostgreSQL owns
persistent job and quiz state, accessed through parameterized queries
with explicit transaction boundaries. Zod validates external and
internal contracts. Groq generates provisional content behind a provider
adapter. Deterministic code controls topic counts, batch sizes, job
state, retries, cancellation, and persistence.

The model should receive a compact batch context: topics, relevant
previous question text, per-topic question counts, mode, difficulty, and
source evidence when available. Internal batch numbers and job
identifiers exist for recovery and observability, not because the model
needs to understand the database.

The most important reliability boundary is the batch commit. A batch is
complete only when its validated questions and progress have been
persisted atomically. That rule, combined with idempotent submission,
worker leases, and guarded state transitions, allows Squizme to recover
from ordinary network and process failures without pretending that
external AI calls execute exactly once.

**Implementation priority:** contracts and database constraints first,
deterministic planning second, validated batch generation third, and
durable worker recovery/cancellation after those foundations are tested.
