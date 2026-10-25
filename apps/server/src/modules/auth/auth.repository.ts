import { randomBytes } from "node:crypto";
import type { Pool } from "pg";

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSessionRow {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  pool: Pool,
  data: {
    username: string;
    email: string;
    passwordHash: string;
  }
): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [data.username.trim(), data.email.trim().toLowerCase(), data.passwordHash]
  );
  return result.rows[0];
}

export async function findUserById(
  pool: Pool,
  id: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE id = $1;`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByUsername(
  pool: Pool,
  username: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE LOWER(username) = LOWER($1);`,
    [username.trim()]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(
  pool: Pool,
  email: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1);`,
    [email.trim()]
  );
  return result.rows[0] || null;
}

export async function findUserByIdentifier(
  pool: Pool,
  identifier: string
): Promise<UserRow | null> {
  const clean = identifier.trim();
  const result = await pool.query<UserRow>(
    `SELECT * FROM users 
     WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
     LIMIT 1;`,
    [clean]
  );
  return result.rows[0] || null;
}

export async function createSession(
  pool: Pool,
  userId: string,
  ttlMs: number = 7 * 24 * 60 * 60 * 1000 // default 7 days
): Promise<UserSessionRow> {
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);

  const result = await pool.query<UserSessionRow>(
    `INSERT INTO user_sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [userId, sessionToken, expiresAt]
  );
  return result.rows[0];
}

export async function findSessionByToken(
  pool: Pool,
  token: string
): Promise<{ session: UserSessionRow; user: UserRow } | null> {
  const result = await pool.query<{
    session_id: string;
    session_token: string;
    user_id: string;
    expires_at: Date;
    session_created_at: Date;
    session_updated_at: Date;
    username: string;
    email: string;
    password_hash: string;
    user_created_at: Date;
    user_updated_at: Date;
  }>(
    `SELECT 
       s.id AS session_id,
       s.session_token,
       s.user_id,
       s.expires_at,
       s.created_at AS session_created_at,
       s.updated_at AS session_updated_at,
       u.id AS user_id,
       u.username,
       u.email,
       u.password_hash,
       u.created_at AS user_created_at,
       u.updated_at AS user_updated_at
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_token = $1 AND s.expires_at > NOW();`,
    [token]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  return {
    session: {
      id: row.session_id,
      user_id: row.user_id,
      session_token: row.session_token,
      expires_at: row.expires_at,
      created_at: row.session_created_at,
      updated_at: row.session_updated_at,
    },
    user: {
      id: row.user_id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },
  };
}

export async function deleteSession(
  pool: Pool,
  token: string
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM user_sessions WHERE session_token = $1;`,
    [token]
  );
  return (result.rowCount ?? 0) > 0;
}
