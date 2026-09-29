# Documentation: @/apps/server/package.json

### Purpose
Defines package metadata, execution scripts, dependencies, and configuration for the `@squizme/server` Fastify application package.

### What happens without it
The server application cannot be managed as a pnpm workspace package, dependencies cannot be resolved, and backend build/test/dev scripts cannot be executed.

### Exports / Scripts
- `dev`: Runs `tsx watch src/index.ts` for live reloading during backend development.
- `build`: Compiles TypeScript source files to JavaScript via `tsc`.
- `start`: Starts the compiled production server with `node dist/index.js`.
- `test`: Executes unit and integration test suites using Vitest (`vitest run`).
- `db:push`: Pushes Drizzle ORM schema migrations directly to the PostgreSQL database via `drizzle-kit push`.
- `db:seed`: Seeds the database with default test credentials via `tsx src/db/seed.ts`.

### Dependency graph
- Depends on:
  - `@google/genai`
  - `@fastify/cors`
  - `@fastify/jwt`
  - `@fastify/multipart`
  - `@fastify/static`
  - `@squizme/shared` (`@/packages/shared`)
  - `bcrypt`
  - `dotenv`
  - `drizzle-orm`
  - `fastify`
  - `fastify-plugin`
  - `mammoth`
  - `pdf-parse`
  - `postgres`
  - `zod`
- Depended on by:
  - Root monorepo build and development pipelines
