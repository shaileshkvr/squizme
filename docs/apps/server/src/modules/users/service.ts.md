# Documentation: @/apps/server/src/modules/users/service.ts

### Purpose
Manages user profile data, quota tracking, and encrypted Gemini API key persistence in PostgreSQL.

### What happens without it
Users cannot save custom API keys, view their account profile, or track remaining free quiz generation quotas.

### Functions
- `getUserProfile(userId: string)`: Retrieves profile details including `firstName`, `lastName`, and computed `name`, and computes `freeGenerationsRemaining` (max 2 free).
- `saveUserApiKey(userId: string, rawKey: string)`: Encrypts Gemini API key with AES-256-GCM and persists in the database.
- `removeUserApiKey(userId: string)`: Clears custom API key from the database record.
- `updateUserProfile(userId: string, firstName: string, lastName?: string)`: Updates user's first name and optional last name.
- `changeUserPassword(userId: string, currentPass: string, newPass: string)`: Compares existing bcrypt hash and stores new password hash.

### Dependency graph
- Depends on:
  - `bcrypt`
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
  - `@/apps/server/src/utils/encryption.ts`
- Depended on by:
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/server/src/modules/generator/service.ts`
