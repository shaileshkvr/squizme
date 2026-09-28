# Documentation: @/apps/server/src/db/index.ts

### Purpose
Initializes the MySQL connection pool using `mysql2/promise` and instantiates the Drizzle ORM database client with schema mappings.

### What happens without it
The backend service cannot connect to MySQL or perform type-safe queries, migrations, and database operations.

### Functions / Exports
- `poolConnection`: `mysql.createPool` instance configured with `DATABASE_URL` (or local fallback).
- `db`: Drizzle ORM instance wrapping `poolConnection` with relational schema support.

### Dependency graph
- Depends on:
  - `drizzle-orm/mysql2`
  - `mysql2/promise`
  - `@/apps/server/src/db/schema.ts`
- Depended on by:
  - All domain modules in `@/apps/server/src/modules/`
