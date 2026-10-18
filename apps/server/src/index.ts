import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDb, pool } from "./db/index.js";
import { runMigrations } from "./db/migrator.js";

async function startServer() {
  const app = await buildApp();

  // Initialize Database Schema via Migrations
  try {
    app.log.info("Running database migrations...");
    const applied = await runMigrations(pool);
    if (applied.length > 0) {
      app.log.info({ applied }, "Applied database migrations successfully.");
    } else {
      app.log.info("Database schema is up to date.");
    }
  } catch (error) {
    app.log.warn(
      { error },
      "Database connection/bootstrap failed on startup. Will continue starting server (endpoints will retry DB on demand)."
    );
  }

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}. Shutting down gracefully...`);
      try {
        await app.close();
        await closeDb();
        app.log.info("Server and database pool closed cleanly.");
        process.exit(0);
      } catch (err) {
        app.log.error({ err }, "Error during graceful shutdown");
        process.exit(1);
      }
    });
  }

  // Start HTTP Listener
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server listening at http://${env.HOST}:${env.PORT}`);
    app.log.info(`Swagger API Documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
