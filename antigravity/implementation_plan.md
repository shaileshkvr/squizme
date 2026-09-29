# Implementation Plan: UI/UX, Responsive, Dark Mode, and Navigation Overhaul

## 1. Overview
This plan addresses the full suite of user feedback:
1. Explaining live development vs production Docker code updates.
2. Replacing cliched violet theme with a modern, high-contrast palette (Teal / Emerald / Slate).
3. Implementing Dark Mode with persistent local storage and root class toggling.
4. Elevating base typography from `text-xs` to `text-sm` / `text-base` across all pages.
5. Making all pages responsive with mobile-friendly touch targets and layouts.
6. Refactoring the Quiz Builder form (slider centered, min 5 questions limit, scope policy below create button).
7. Adding tactile micro-interactions (hover scale, elevation shadows, active button states).
8. Redesigning Navbar (remove static create button, show dynamic create button only when scrolled or on subpages, right-align About/Privacy, replace simple logout with interactive profile popup menu with click-outside listener, password change, API key settings, and reddish sign out).
9. Updating `docs/` with 100% mirrored documentation.

---

## 2. Tasks Breakdown

### Task 15: Color Palette Overhaul & Dark Mode Foundation
- Create `apps/client/src/context/ThemeContext.tsx` with `'light' | 'dark' | 'system'` support and persistence.
- Configure `apps/client/src/index.css` for Tailwind dark mode with `@variant dark (&:where(.dark, .dark *));`.
- Set default background and text colors to support seamless dark theme transitions.
- Replace indigo/violet colors across all components with Teal (`teal-600`, `teal-500`) and Emerald (`emerald-600`, `emerald-500`).

### Task 16: Typography & Font Scaling
- Replace `text-xs` instances across forms, badges, headers, descriptions, cards, and modal walkthroughs with `text-sm` and `text-base`.
- Increase base body font size and optimize line-heights and text contrast for dark/light modes.

### Task 17: Navbar Redesign & Interactive Profile Popup
- Track route and window scroll position (`scrollY > 150` on `/` or `pathname !== '/'`) to conditionally render the "Create Quiz" button.
- Move "About" and "Privacy Policy" links to the right side of the navbar.
- Hide "Sign Up" button completely when authenticated.
- Build User Avatar/Profile trigger and popup window:
  - Display name and email.
  - "Update API Key" option (opens `ApiKeyModal`).
  - "Change Password" modal / action.
  - Reddish "Sign Out" button (`text-red-500 hover:bg-red-500/10`).
  - Dark mode toggle button (Sun/Moon).
  - Click-outside and Escape key listener to close the popup automatically.

### Task 18: Quiz Builder Refactor
- Update minimum question limit from 3 to **5** in both client and validation logic.
- Center the slider input horizontally with a clear number badge and responsive width.
- Refactor the form cards and source toggles (Topic vs Document) with clean borders, focus rings, and dark mode support.
- Relocate the "Recommended Scope Policy" callout banner directly *below* the "Generate Quiz" button.

### Task 19: Full Responsive Design Overhaul
- Verify and adapt all pages for mobile screens (`< 640px`):
  - Stacked grids on mobile for Quiz Builder, Dashboard, and Quiz Player.
  - Mobile menu / responsive bar in Navbar.
  - Touch targets with minimum 44px height.
  - Scorecard review with responsive stats and wrapped explanations.

### Task 20: Tactile Animations & Micro-Interactions
- Add smooth transitions (`transition-all duration-200 ease-out`).
- Hover elevation shadows and micro-scaling (`hover:-translate-y-0.5`, `hover:shadow-md`).
- Active press states (`active:scale-[0.98]`).
- Smooth card border glows on hover.

### Task 21: Backend Profile/Password Support & Documentation Mirroring
- Add password change endpoint `/api/users/change-password` in `apps/server/src/modules/users/`.
- Update `docs/` for all created or modified files.
- Run tests (`pnpm test`) and builds (`pnpm build`).
