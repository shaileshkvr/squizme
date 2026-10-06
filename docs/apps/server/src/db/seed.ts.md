# Documentation: @/apps/server/src/db/seed.ts

### Purpose
Database seeding utility creating or updating the default test user account (`testacc404@gmail.com`) with a pre-configured bcrypt-hashed password.

### What happens without it
Developers and testers must manually register an account through the UI or API before testing authenticated workflows.

### Functions
- `seedTestUser()`: Checks for existence of `testacc404@gmail.com`, hashes the password `#test-user-404` with bcrypt (10 rounds), and inserts or updates the record with `firstName: 'Test'` and `lastName: 'User'`.

### Dependency graph
- Depends on:
  - `bcrypt`
  - `node:crypto`
  - `drizzle-orm`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
- Depended on by:
  - `pnpm --filter @squizme/server db:seed`
