# Documentation: @/pnpm-lock.yaml

### Purpose
Deterministic dependency lockfile recording resolved package versions, integrity hashes, and dependency trees across all pnpm workspace packages.

### What happens without it
Package installations across different environments or CI could resolve divergent, breaking sub-dependencies.

### Dependency graph
- Depends on:
  - `@/package.json`
  - `@/pnpm-workspace.yaml`
  - Workspace package manifests
- Depended on by:
  - `pnpm install` CLI
