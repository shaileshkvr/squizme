# Documentation: @/apps/client/src/components/Navbar.tsx

### Purpose
Provides application-wide floating navigation, theme switching (dark/light), and an interactive account profile popup with password changes, name edits, quota indicators, and local Groq API key management.

### What happens without it
Users cannot toggle themes, manage their profile/password, access key settings, or navigate between the dashboard and documentation policies.

### Key Features
- **Floating Content-Aligned Island Layout**: Aligns with the main content boundaries (`max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8`) with `rounded-full` pill geometry, elevated shadow, and a top margin lift (`sticky top-3 sm:top-5`).
- **Right-Aligned Policy Links**: Direct links to `/about` and `/privacy`.
- **Theme Switcher**: Instant toggle between dark and light themes with persistence.
- **Account Popup**:
  - Displays user first/last name and email, falling back to computed name or email.
  - Inline first and last name editing (`updateName(firstName, lastName)`).
  - Expandable password change subform with dynamic green/red border feedback and `text-sm` warnings enforcing complexity rules (min 8 characters, 1 letter, 1 number, 1 special character).
  - Groq API key configuration trigger (`ApiKeyModal`).
  - Quota status indicator (free remaining vs. BYO key active).
  - Reddish accented Sign Out button (`text-[#9A4D3F] dark:text-[#D98678]`).
  - Click-outside and Escape key dismissal.
- **Zero Sign-Up Leak**: Removes sign-up triggers when an active session is detected.
- **Coffee & Walnut Tokens**: Fully styled with the warm coffee/walnut tokens and dusty blue AI accent icons.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/packages/shared/src/schemas/user.ts`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/context/ThemeContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
