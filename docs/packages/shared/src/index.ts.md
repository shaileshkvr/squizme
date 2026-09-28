# Documentation: @/packages/shared/src/index.ts

### Purpose
Root entry point and re-export hub for all shared domain schemas and types.

### What happens without it
Consumers cannot import schemas cleanly from `@squizme/shared`.

### Exports
- All exports from `./schemas/user.js`, `./schemas/quiz.js`, `./schemas/attempt.js`.

### Dependency graph
- Depends on:
  - `@/packages/shared/src/schemas/user.ts`
  - `@/packages/shared/src/schemas/quiz.ts`
  - `@/packages/shared/src/schemas/attempt.ts`
- Depended on by:
  - `@/apps/server`
  - `@/apps/client`
