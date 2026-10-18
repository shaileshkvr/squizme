import { afterAll, describe, expect, it } from "vitest";
import { pool, closeDb } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrator.js";

describe("Database Migrator", () => {
  afterAll(async () => {
    await closeDb();
  });

  it("applies pending migrations successfully and idempotently", async () => {
    // First run - should apply 001 and 002 (or report previously applied)
    const applied = await runMigrations(pool);
    expect(Array.isArray(applied)).toBe(true);

    // Verify schema_migrations table exists and has entries
    const { rows: migrationRows } = await pool.query(
      "SELECT name FROM schema_migrations ORDER BY name ASC;"
    );
    const names = migrationRows.map((r) => r.name);
    expect(names).toContain("001_initial_schema.sql");
    expect(names).toContain("002_generation_jobs.sql");

    // Verify generation_jobs table exists with correct columns
    const { rows: tableRows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('quizzes', 'attempts', 'generation_jobs', 'generation_job_batches');
    `);
    const tableNames = tableRows.map((r) => r.table_name);
    expect(tableNames).toContain("quizzes");
    expect(tableNames).toContain("attempts");
    expect(tableNames).toContain("generation_jobs");
    expect(tableNames).toContain("generation_job_batches");

    // Second run - should be a no-op and return empty array
    const secondRun = await runMigrations(pool);
    expect(secondRun).toEqual([]);
  });
});
