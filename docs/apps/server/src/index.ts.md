# Documentation: @/apps/server/src/index.ts

### Purpose
Main runtime entry point for the Fastify server application.

### What happens without it
The backend service cannot start, accept HTTP connections, or dispatch requests to domain modules.

### Setup and plugins
- Registers `@fastify/cors` for cross-origin client requests.
- Registers `@fastify/multipart` with 20MB size guard and 1 file limit.
- Registers custom JWT auth plugin.
- Mounts `/health` and domain module routes under `/api/`.

### Dependency graph
- Depends on:
  - `fastify`
  - `@fastify/cors`
  - `@fastify/multipart`
  - `dotenv`
  - `@/apps/server/src/plugins/auth.ts`
  - `@/apps/server/src/modules/auth/routes.ts`
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/server/src/modules/generator/routes.ts`
  - `@/apps/server/src/modules/quizzes/routes.ts`
  - `@/apps/server/src/modules/attempts/routes.ts`
- Depended on by:
  - Root execution runtime and Docker production container
