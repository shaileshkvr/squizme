# Documentation: @/apps/client/color-palette.md

### Purpose
Specifies the warm coffee, walnut, chocolate-cream, and dusty blue design system tokens, contrast ratio evaluations, and UI role mappings.

### What happens without it
Design consistency drifts across views, leading to mismatched colors and potential WCAG AA contrast failures.

### Key Features
- **Semantic Neutral Hierarchy**: Warm paper cream (`#F8F4EB`, `#FFFDF8`, `#F1EADF`) in light mode; deep espresso/walnut (`#1D0D00`, `#2A160B`, `#3B1E11`) in dark mode.
- **Audited Contrast Ratios**: Light muted text tuned to `#847366` for 4.52:1 WCAG AA compliance; dark card border tuned to `#5A3E30` for 2.0:1 card-to-background contrast.
- **Dusty Blue AI Accent**: 10–20% allocation for AI indicators, focus states, and hyperlinks (`#416A7A` light / `#79AFC2` dark).
- **Earthy Status Accents**: Forest green success, warm amber warning, and terracotta error colors.

### Dependency graph
- Implemented in:
  - `@/apps/client/src/index.css`
  - `@/apps/client/src/components/Navbar.tsx`
  - `@/apps/client/src/components/LandingHero.tsx`
  - All client pages
