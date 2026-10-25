ALTER TABLE generation_jobs
ADD COLUMN IF NOT EXISTS last_error_message TEXT;
