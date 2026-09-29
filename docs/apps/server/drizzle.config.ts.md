# Documentation: @/apps/server/drizzle.config.ts

### Purpose
Configures `drizzle-kit` CLI commands (`db:push`, migrations) for PostgreSQL schema generation and synchronization.

### What happens without it
`drizzle-kit push` cannot locate the schema definitions, output directories, or database connection URL to migrate PostgreSQL.

### Configuration Properties
- `schema`: Path to schema definitions (`./src/db/schema.ts`).
- `out`: Directory for generated SQL migration files (`./drizzle`).
- `dialect`: Database dialect (`postgresql`).
- `dbCredentials.url`: PostgreSQL connection string from `DATABASE_URL` (or fallback).

### Dependency graph
- Depends on:
  - `drizzle-kit`
  - `@/apps/server/src/db/schema.ts`
- Depended on by:
  - `apps/server/package.json` script `db:push`
