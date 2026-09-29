# Documentation: @/apps/client/src/index.css

### Purpose
Declares the global styling layer and imports Tailwind CSS v4 design tokens and utilities.

### What happens without it
The application renders completely unstyled with browser default fonts, margins, and layouts.

### Rules & Styles
- `@import "tailwindcss"`: Injects Tailwind CSS v4 design utility system.
- Base typography styles on `body`.

### Dependency graph
- Depends on:
  - `tailwindcss`
- Depended on by:
  - `@/apps/client/src/main.tsx`
