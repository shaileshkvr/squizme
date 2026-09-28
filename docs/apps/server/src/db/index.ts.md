# Documentation: @/apps/server/src/db/index.ts

### Purpose
Initializes the PostgreSQL connection client using `postgres` and instantiates the Drizzle ORM database client (`drizzle-orm/postgres-js`) with schema mappings.

### What happens without it
The backend service cannot connect to PostgreSQL or perform type-safe queries, migrations, and database operations.

### Functions / Exports
- `client`: `postgres` client instance configured with `DATABASE_URL` (or local fallback `postgresql://postgres:rootpassword@localhost:5432/squizme`).
- `db`: Drizzle ORM instance wrapping `client` with PostgreSQL relational schema support.

### Dependency graph
- Depends on:
  - `drizzle-orm/postgres-js`
  - `postgres`
  - `@/apps/server/src/db/schema.ts`
- Depended on by:
  - All domain modules in `@/apps/server/src/modules/`
