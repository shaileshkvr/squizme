# Documentation: @/apps/client/vite.config.ts

### Purpose
Configures Vite build tooling, React Fast Refresh plugin, Tailwind CSS v4 Vite plugin, and the `/api` development proxy to the backend server.

### What happens without it
Vite cannot compile React components, process Tailwind styles, or proxy API requests to the Fastify server on port 3001.

### Configuration
- `plugins`: `@vitejs/plugin-react`, `@tailwindcss/vite`
- `server.port`: `5173`
- `server.proxy['/api']`: Forwards requests to `http://localhost:3001` with `changeOrigin: true`.

### Dependency graph
- Depends on:
  - `vite`
  - `@vitejs/plugin-react`
  - `@tailwindcss/vite`
- Depended on by:
  - Vite dev server and build runner
