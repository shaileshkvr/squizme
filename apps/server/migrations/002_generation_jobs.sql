DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'generation_job_status') THEN
    CREATE TYPE generation_job_status AS ENUM (
      'queued', 'planning', 'generating', 'finalizing',
      'cancel_requested', 'cancelled', 'completed', 'failed'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS generation_jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL,
  idempotency_key         VARCHAR(128) NOT NULL,
  request_hash            VARCHAR(64) NOT NULL,
  status                  generation_job_status NOT NULL DEFAULT 'queued',
  request_snapshot        JSONB NOT NULL,
  source_id               UUID,
  quiz_id                 UUID REFERENCES quizzes(id) ON DELETE SET NULL,
  planned_question_count  INTEGER NOT NULL,
  accepted_question_count INTEGER NOT NULL DEFAULT 0,
  completed_batch_count   INTEGER NOT NULL DEFAULT 0,
  total_batch_count       INTEGER NOT NULL DEFAULT 0,
  plan                    JSONB,
  last_error_code         VARCHAR(64),
  attempt_count           INTEGER NOT NULL DEFAULT 0,
  lease_owner             VARCHAR(128),
  lease_expires_at        TIMESTAMPTZ,
  heartbeat_at            TIMESTAMPTZ,
  cancel_requested_at     TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,

  CONSTRAINT uq_user_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_gen_jobs_user_status
  ON generation_jobs (user_id, status)
  WHERE status NOT IN ('completed', 'cancelled', 'failed');

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_active_job_per_user
  ON generation_jobs (user_id)
  WHERE status NOT IN ('completed', 'cancelled', 'failed');

CREATE INDEX IF NOT EXISTS idx_gen_jobs_queued
  ON generation_jobs (created_at)
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_gen_jobs_stale_lease
  ON generation_jobs (lease_expires_at)
  WHERE status IN ('planning', 'generating', 'finalizing')
    AND lease_expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS generation_job_batches (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                  UUID NOT NULL REFERENCES generation_jobs(id) ON DELETE CASCADE,
  batch_number            INTEGER NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'pending',
  planned_question_count  INTEGER NOT NULL,
  accepted_question_count INTEGER NOT NULL DEFAULT 0,
  attempt_count           INTEGER NOT NULL DEFAULT 0,
  topic_allocation        JSONB NOT NULL,
  last_error_code         VARCHAR(64),
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,

  CONSTRAINT uq_job_batch UNIQUE (job_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_gen_batches_job_id
  ON generation_job_batches (job_id);
