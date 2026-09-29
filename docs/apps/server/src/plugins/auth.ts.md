# Documentation: @/apps/server/src/plugins/auth.ts

### Purpose
Registers Fastify JWT authentication plugin (`@fastify/jwt`) and decorates the Fastify instance with an `authenticate` pre-handler hook for route authorization.

### What happens without it
Protected routes cannot verify caller JWT bearer tokens, authenticate user identities, or extract the authenticated user's ID/role.

### Functions & Decorators
- `authenticate(request, reply)`: Pre-handler method that calls `request.jwtVerify()`. On failure, halts the request and returns HTTP 401 Unauthorized.
- Type declarations for `FastifyInstance.authenticate` and `FastifyJWT.user`.

### Dependency graph
- Depends on:
  - `fastify-plugin`
  - `@fastify/jwt`
  - `fastify`
- Depended on by:
  - `@/apps/server/src/index.ts`
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/server/src/modules/quizzes/routes.ts`
  - `@/apps/server/src/modules/attempts/routes.ts`
  - `@/apps/server/src/modules/generator/routes.ts`
