# Documentation: @/apps/server/tsconfig.json

### Purpose
Specifies TypeScript compiler options for `@squizme/server`, extending the root configuration and designating compilation source roots and build output targets.

### What happens without it
TypeScript compiler (`tsc`) cannot resolve compilation boundaries, root directory mappings, or emission targets (`dist/`), causing build failures.

### Configuration Details
- `extends`: `../../tsconfig.base.json`
- `compilerOptions.outDir`: `./dist`
- `compilerOptions.rootDir`: `./src`
- `include`: `src/**/*`

### Dependency graph
- Depends on:
  - `@/tsconfig.base.json`
- Depended on by:
  - Backend compilation pipeline (`pnpm --filter @squizme/server build`)
