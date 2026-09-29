# Documentation: @/apps/client/src/components/Navbar.tsx

### Purpose
Provides application-wide top navigation, scroll-aware "Create Quiz" visibility, theme switching (dark/light), and an interactive account profile popup with password changes, name edits, quota indicators, and local API key management.

### What happens without it
Users cannot toggle themes, manage their profile/password, access key settings, or navigate between the quiz studio and documentation policies.

### Key Features
- **Dynamic Create Quiz Button**: Appears only on subpages or when scrolled past the top hero banner on `/`.
- **Right-Aligned Policy Links**: Direct links to `/about` and `/privacy`.
- **Theme Switcher**: Instant toggle between dark and light themes with persistence.
- **Account Popup**:
  - Displays user name and email.
  - Inline display name editing (`updateName`).
  - Expandable password change subform with validation (`changePassword`).
  - Google Gemini API key configuration trigger (`ApiKeyModal`).
  - Quota status indicator (free remaining vs. BYO key active).
  - Reddish accented Sign Out button (`text-red-600 dark:text-red-400`).
  - Click-outside and Escape key dismissal.
- **Zero Sign-Up Leak**: Removes sign-up triggers when an active session is detected.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/context/ThemeContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
