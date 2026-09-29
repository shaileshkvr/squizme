# Documentation: @/apps/server/src/modules/auth/routes.ts

### Purpose
Exposes public HTTP authentication endpoints for registering new accounts and exchanging valid credentials for signed JWT bearer tokens.

### What happens without it
Clients cannot initiate user sessions, authenticate against the server, or obtain access tokens to make authenticated requests.

### Endpoints
- `POST /register`: Accepts `{ email, password, name }`, validates payload with `RegisterRequestSchema`, creates user via `registerUser`, and returns `{ user, token }` with status 201.
- `POST /login`: Accepts `{ email, password }`, validates payload with `LoginRequestSchema`, verifies credentials via `authenticateUser`, and returns `{ user, token }` with status 200.

### Dependency graph
- Depends on:
  - `fastify`
  - `@squizme/shared`
  - `@/apps/server/src/modules/auth/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
