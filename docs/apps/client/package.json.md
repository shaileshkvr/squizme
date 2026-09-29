# Documentation: @/apps/client/package.json

### Purpose
Defines package metadata, scripts, and runtime/dev dependencies for the `@squizme/client` Single Page Application (SPA).

### What happens without it
The client application cannot be resolved in the pnpm workspace, managed, or built.

### Scripts
- `dev`: Starts the Vite local development server on port 5173 with API proxying.
- `build`: Runs TypeScript typechecking (`tsc`) followed by Vite production bundling.
- `preview`: Serves the production build locally.

### Dependency graph
- Depends on:
  - `@squizme/shared` (`@/packages/shared`)
  - `clsx`
  - `lucide-react`
  - `react`
  - `react-dom`
  - `react-router-dom`
  - `tailwind-merge`
- Depended on by:
  - Root workspace build pipeline
