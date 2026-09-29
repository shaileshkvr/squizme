# Documentation: @/apps/client/index.html

### Purpose
Single-page application HTML entry document providing viewport meta tags, document title, root mounting DOM node (`#root`), and module script loading.

### What happens without it
The browser has no HTML host page to parse, mount the React application tree, or load stylesheets and scripts.

### Elements
- `#root`: Container DOM node where React mounts.
- `<script type="module" src="/src/main.tsx">`: Entry point bundle bootstrap script.

### Dependency graph
- Depends on:
  - `@/apps/client/src/main.tsx`
- Depended on by:
  - Vite dev server and production HTML build
