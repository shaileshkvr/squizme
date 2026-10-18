import { closeDb, pool } from "./db/index.js";
import { runMigrations } from "./db/migrator.js";
import { GenerationWorker } from "./modules/generation/jobs/job.worker.js";

async function runWorkerProcess() {
  console.log("[Worker] Starting background generation worker...");
  await runMigrations(pool);

  const worker = new GenerationWorker(pool);
  console.log(`[Worker] Worker initialized with id: ${worker.workerId}`);

  const shutdown = async () => {
    console.log("[Worker] Shutting down gracefully...");
    worker.stop();
    await closeDb();
    console.log("[Worker] Exited cleanly.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await worker.start();
}

runWorkerProcess().catch(async (err) => {
  console.error("[Worker] Fatal startup error:", err);
  await closeDb();
  process.exit(1);
});
