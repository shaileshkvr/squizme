# Documentation: @/packages/shared/tsconfig.json

### Purpose
TypeScript configuration for `@squizme/shared`, extending the root `tsconfig.base.json` and setting compilation targets and output paths.

### What happens without it
TypeScript compiler (`tsc`) will not know source roots, output directories (`dist/`), or compilation settings when building `@squizme/shared`.

### Configuration Details
- `extends`: `../../tsconfig.base.json`
- `compilerOptions.outDir`: `./dist`
- `compilerOptions.rootDir`: `./src`
- `include`: `src/**/*`

### Dependency graph
- Depends on:
  - `@/tsconfig.base.json`
- Depended on by:
  - Build pipeline (`pnpm --filter @squizme/shared build`)
