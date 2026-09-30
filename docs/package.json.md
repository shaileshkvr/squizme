# Documentation: @/package.json

### Purpose
Defines root workspace scripts and root dependencies for the Squizme monorepo.

### What happens without it
pnpm cannot resolve workspace members or run unified build and test scripts across apps and packages.

### Exports / Scripts
- `dev`: Runs server and client concurrently via pnpm parallel filter.
- `dev:all`: Starts PostgreSQL in background via Docker and launches client/server live development.
- `dev:server`: Runs the Fastify backend with TSX watch mode.
- `dev:client`: Runs the Vite frontend development server with HMR.
- `build`: Builds all workspace packages in topological order.
- `test`: Executes test suites across packages.

### Dependency graph
- Depends on: None.
- Depended on by: All child workspace members.
