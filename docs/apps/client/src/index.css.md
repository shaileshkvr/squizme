# Documentation: @/apps/client/src/index.css

### Purpose
Declares the global styling layer, imports Tailwind CSS v4 design tokens, and sets up semantic CSS variables for the warm coffee, walnut, and chocolate-cream design palette with an `@theme` mapping.

### What happens without it
The application renders completely unstyled with browser default fonts, margins, and layouts.

### Rules & Styles
- `@import "tailwindcss"`: Injects Tailwind CSS v4 design utility system.
- `@custom-variant dark`: Integrates class-based dark mode (`.dark`).
- `:root` and `.dark` variables: Defines semantic color tokens for background, card surfaces, text hierarchies, borders, walnut primary action colors, and dusty blue AI accents.
- `@theme` mapping: Maps CSS variables to Tailwind utility classes (`bg-brand-bg`, `bg-brand-card`, `bg-brand-elevated`, `text-brand-text`, `text-brand-secondary`, `text-brand-muted`, `border-brand-border`, `bg-brand-primary`, `text-brand-ai`, etc.).
- Base styles on `body`: Sets default background, text color, system typography, and background/color transition smoothing.

### Dependency graph
- Depends on:
  - `tailwindcss`
- Depended on by:
  - `@/apps/client/src/main.tsx`
