# Documentation: @/apps/server/src/modules/users/routes.ts

### Purpose
Provides authenticated REST endpoints for managing the user profile and their personal Gemini API key.

### What happens without it
Clients cannot retrieve user quota status or configure a personal Gemini API key.

### Endpoints
- `GET /profile`: Requires authentication. Returns user identity, quota usage, remaining free generations, and key status.
- `PATCH /profile`: Requires authentication. Updates user display name.
- `POST /change-password`: Requires authentication. Verifies current password and updates hash.
- `PUT /api-key`: Requires authentication. Validates key schema and securely persists the encrypted API key.
- `DELETE /api-key`: Requires authentication. Removes the saved API key from the user account.

### Dependency graph
- Depends on:
  - `fastify`
  - `@squizme/shared`
  - `@/apps/server/src/modules/users/service.ts`
- Depended on by:
  - `@/apps/server/src/index.ts`
