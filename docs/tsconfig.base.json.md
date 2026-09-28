# Documentation: @/tsconfig.base.json

### Purpose
Shared TypeScript base configuration extended by all packages and applications across the monorepo (`packages/shared`, `apps/server`, `apps/client`).

### What happens without it
Each package would need redundant TypeScript compiler definitions, risking inconsistent strictness, module resolution, and target syntax.

### Configuration settings
- `target`: `ES2022`
- `module`: `NodeNext`
- `moduleResolution`: `NodeNext`
- `strict`: `true`
- `declaration`: `true`

### Dependency graph
- Depends on: None.
- Depended on by:
  - `@/packages/shared/tsconfig.json`
  - `@/apps/server/tsconfig.json`
  - `@/apps/client/tsconfig.json`
