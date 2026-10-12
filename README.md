# Squizme

Modular pnpm monorepo consisting of a Fastify backend API, a Dockerized PostgreSQL database, and a minimal React frontend.

## Structure

```
squizme/
├── apps/
│   ├── client/       # React (Vite) frontend
│   └── server/       # Fastify backend API
├── packages/
│   └── shared/       # Shared TypeScript schemas and types
├── docker-compose.yml # PostgreSQL container configuration
├── package.json      # Workspace root and orchestration scripts
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js**: >= 20
- **pnpm**: >= 9
- **Docker & Docker Compose**

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start services (PostgreSQL container, backend, and frontend):**
   ```bash
   pnpm dev:all
   ```

## Services & Ports

| Service | URL / Port | Notes |
| :--- | :--- | :--- |
| **Client** | `http://localhost:5173` | React development server |
| **Server** | `http://localhost:6001` | Fastify backend API |
| **Swagger UI** | `http://localhost:6001/docs` | Interactive OpenAPI documentation |
| **Health Check** | `http://localhost:6001/health` | Service status |
| **DB Health Check** | `http://localhost:6001/health/db` | Database connection status |
| **PostgreSQL** | `localhost:5432` | Container name: `squizme-postgres` |

## Available Scripts

- `pnpm dev:all` - Starts the PostgreSQL container and runs both client and server concurrently
- `pnpm dev:server` - Starts only the Fastify backend in watch mode
- `pnpm dev:client` - Starts only the Vite frontend dev server
- `pnpm db:up` - Starts the PostgreSQL container via Docker Compose
- `pnpm db:down` - Stops the PostgreSQL container
- `pnpm build` - Builds all workspace packages
- `pnpm typecheck` - Runs TypeScript checks across all workspaces
