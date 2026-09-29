# Documentation: @/Dockerfile

### Purpose
Defines the multi-stage container build packaging both the Fastify backend and Vite React static assets into a single lightweight production Alpine image.

### What happens without it
Docker cannot produce a standardized, reproducible production container for deployment.

### Stages
1. `builder`: Installs all dependencies across the pnpm monorepo and compiles TypeScript across shared package, server, and client.
2. `runner`: Copies compiled server `dist/` and client `public/` assets, installs production-only dependencies, and launches the Fastify server with Node.js 22.

### Dependency graph
- Depends on:
  - `node:22-alpine`
  - Root monorepo workspace files
- Depended on by:
  - `docker-compose.yml`
