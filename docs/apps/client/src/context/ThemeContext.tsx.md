# Documentation: @/apps/client/src/context/ThemeContext.tsx

### Purpose
Provides dynamic dark mode and light mode theming across the application with persistent storage in `localStorage` and system media query synchronization.

### What happens without it
The application remains in a single static theme without user control or reactive dark/light styling.

### Functions & Hooks
- `ThemeProvider`: Context provider wrapping the application root that synchronizes the `.dark` class on `<html>`.
- `useTheme()`: Hook exposing `theme`, `isDark`, `toggleTheme()`, and `setTheme()`.

### Dependency graph
- Depends on:
  - `react`
- Depended on by:
  - `@/apps/client/src/App.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
  - Various UI pages and popups
