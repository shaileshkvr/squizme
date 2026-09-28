# Documentation: @/packages/shared/package.json

### Purpose
Defines package metadata, module entry points, build/test scripts, and runtime/dev dependencies for the `@squizme/shared` workspace package.

### What happens without it
The shared package cannot be identified or resolved by pnpm workspaces, and other packages/apps cannot consume `@squizme/shared`.

### Exports / Scripts
- `build`: Runs TypeScript compiler (`tsc`) to generate JavaScript and declaration files into `dist/`.
- `test`: Runs unit tests using Vitest (`vitest run`).
- `main`: `./dist/index.js`
- `types`: `./dist/index.d.ts`

### Dependency graph
- Depends on:
  - `zod` (runtime)
  - `typescript` (dev)
  - `vitest` (dev)
- Depended on by:
  - `@/apps/server`
  - `@/apps/client`
