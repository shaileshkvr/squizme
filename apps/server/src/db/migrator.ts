import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations(
  pool: Pool,
  customMigrationsDir?: string
): Promise<string[]> {
  const migrationsDir =
    customMigrationsDir || resolve(__dirname, "../../migrations");

  const client = await pool.connect();
  const appliedMigrations: string[] = [];

  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Fetch already applied migrations
    const { rows: existingRows } = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations ORDER BY id ASC;"
    );
    const existingNames = new Set(existingRows.map((r) => r.name));

    // Discover migration files
    const allFiles = await readdir(migrationsDir);
    const sqlFiles = allFiles
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const sqlFile of sqlFiles) {
      if (existingNames.has(sqlFile)) {
        continue;
      }

      const filePath = join(migrationsDir, sqlFile);
      const sqlContent = await readFile(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query(
          "INSERT INTO schema_migrations (name) VALUES ($1);",
          [sqlFile]
        );
        await client.query("COMMIT");
        appliedMigrations.push(sqlFile);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration failed for ${sqlFile}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    return appliedMigrations;
  } finally {
    client.release();
  }
}
