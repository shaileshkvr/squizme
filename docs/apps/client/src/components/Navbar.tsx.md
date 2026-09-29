# Documentation: @/apps/client/src/components/Navbar.tsx

### Purpose
Header navigation bar displaying the Squizme brand, public navigation links (About, Privacy), remaining quota badge (or BYO key status indicator), quick quiz creation button, and session controls.

### What happens without it
Users cannot view their quota status, navigate across views, trigger the API key configuration modal, or log out.

### Key elements
- Brand logo linking to home.
- Navigation links for About and Privacy & Policies.
- Quota indicator pill: Shows "Free: X/2 left" or "BYO Key Active". Clicking triggers `onOpenApiKeyModal`.
- "Create Quiz" shortcut button.
- Logout action button.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
