# Documentation: @/apps/client/src/pages/Auth.tsx

### Purpose
Provides authentication pages for existing user sign-in and new account registration, validating minimum password length, and saving JWT credentials to context and local storage.

### What happens without it
Users cannot authenticate, log into existing accounts (including the seeded test account), or register new profiles.

### Key Features
- **Dual Flow**: Single card toggles between registration (with display name) and login.
- **Teal / Slate Theme**: High contrast inputs and buttons supporting dark and light themes.
- **Error Feedback**: Accessible alert callout for validation and invalid credential messages.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
