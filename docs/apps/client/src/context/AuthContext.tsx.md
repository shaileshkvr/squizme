# Documentation: @/apps/client/src/context/AuthContext.tsx

### Purpose
Provides authentication state, profile synchronization, quota checking, and JWT persistence to the entire React tree.

### What happens without it
Components cannot inspect the active user, determine remaining quota limits, or pass bearer tokens to the API.

### Functions
- `login(token, user)`: Saves token in localStorage and sets reactive state.
- `logout()`: Clears token and resets user state.
- `refreshProfile()`: Fetches `/api/users/profile` to update quota counts.
- `updateName(newName)`: Updates display name via `/api/users/profile`.
- `changePassword(currentPassword, newPassword)`: Changes password via `/api/users/change-password`.
- `useAuth()`: Custom hook to access auth context.

### Dependency graph
- Depends on:
  - `react`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - All page and navbar components in `@/apps/client`
