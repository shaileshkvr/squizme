import { client, db } from './index.js';
import bcrypt from 'bcrypt';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

export async function bootstrapDatabase() {
  try {
    await client`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        CREATE TYPE quiz_source_type AS ENUM ('prompt', 'pdf', 'docx', 'manual');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await client`
      DO $$ BEGIN
        CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'timed_out', 'abandoned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await client`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        custom_gemini_api_key TEXT,
        free_generations_used INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(36) PRIMARY KEY,
        creator_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source_type quiz_source_type NOT NULL,
        source_metadata JSONB,
        settings JSONB NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(36) PRIMARY KEY,
        quiz_id VARCHAR(36) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        type question_type NOT NULL,
        prompt TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answers JSONB NOT NULL,
        explanation TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 1,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id VARCHAR(36) PRIMARY KEY,
        quiz_id VARCHAR(36) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        status attempt_status NOT NULL DEFAULT 'in_progress',
        score_awarded NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        total_points NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        is_passed BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS attempt_answers (
        id VARCHAR(36) PRIMARY KEY,
        attempt_id VARCHAR(36) NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        question_id VARCHAR(36) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        submitted_answer JSONB NOT NULL,
        is_correct BOOLEAN NOT NULL,
        points_earned NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        graded_feedback TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Seed test account if not exists
    const existing = await db.select().from(users).where(eq(users.email, 'testacc404@gmail.com')).limit(1);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash('#test-user-404', 10);
      await db.insert(users).values({
        id: '65316d9f-a8b3-4c1d-bf4d-1bb87e1f5111',
        email: 'testacc404@gmail.com',
        passwordHash,
        name: 'Test Explorer 404',
        role: 'user',
        freeGenerationsUsed: 0
      });
      console.log('Pre-seeded test account: testacc404@gmail.com');
    }
  } catch (err) {
    console.error('Database bootstrap warning:', err);
  }
}
