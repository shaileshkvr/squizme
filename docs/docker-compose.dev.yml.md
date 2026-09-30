# Documentation: @/docker-compose.dev.yml

### Purpose
Provides a development-specific Docker Compose orchestration file enabling hot-reloading development with live host volume mounts for client and server.

### What happens without it
Developers wanting to run fully containerized environments would have to rebuild the image upon every code change.

### Key Features
- **Postgres Service**: PostgreSQL 16 container with persistent data volume and health check.
- **App-Dev Service**: Mounts root directory into container `/app` with excluded `node_modules` volumes to preserve container binaries.
- **Dual Ports**: Exposes Vite dev server (`5173`) and Fastify server (`3001`).
- **Live Script**: Runs `pnpm dev` with Corepack enabled to trigger instant HMR and Fastify TSX watch mode.

### Dependency graph
- Depends on:
  - `docker-compose.yml`
  - `Dockerfile`
  - `pnpm-workspace.yaml`
- Depended on by:
  - Developer local workflow
