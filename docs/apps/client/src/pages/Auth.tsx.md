# Documentation: @/apps/client/src/pages/Auth.tsx

### Purpose
Authentication view providing login and registration forms for account access.

### What happens without it
Users cannot authenticate, register accounts, or access protected quiz creation and attempts workflows.

### Endpoints used
- `POST /api/auth/login`: Signs in existing users.
- `POST /api/auth/register`: Creates new accounts with name, email, and password.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
