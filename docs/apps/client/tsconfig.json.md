# Documentation: @/apps/client/tsconfig.json

### Purpose
Specifies TypeScript compiler configuration for the Vite React frontend application.

### What happens without it
TypeScript compiler cannot transpile JSX, bundle modules using Vite's bundler resolution, or typecheck React components.

### Configuration Properties
- `target`: `ES2022`
- `jsx`: `react-jsx` (automatic JSX runtime)
- `moduleResolution`: `bundler`
- `noEmit`: `true` (Vite handles JavaScript emission)

### Dependency graph
- Depends on:
  - `@/tsconfig.base.json`
- Depended on by:
  - `pnpm --filter @squizme/client build`
