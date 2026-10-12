import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

export async function pingDb(): Promise<boolean> {
  try {
    const res = await pool.query("SELECT 1 AS alive");
    return res.rows[0]?.alive === 1;
  } catch (error) {
    return false;
  }
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
