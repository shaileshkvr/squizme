# Documentation: @/apps/client/src/App.tsx

### Purpose
Top-level routing, shell layout, footer navigation, and authentication protection wrapper for the React application.

### What happens without it
The single page application lacks route definitions, navigation shell, footer links, and page switching logic.

### Components
- `ProtectedRoute`: Guards authenticated routes (`/`, `/quizzes/new`, `/quizzes/:id/play`, `/attempts/:id`), redirecting unauthenticated users to `/auth`.
- Public routes: `/auth`, `/about`, and `/privacy`.
- `AppContent`: Renders `Navbar`, page content via `<Routes>`, footer links, and the global `ApiKeyModal`.
- `App`: Wraps `AppContent` with `BrowserRouter` and `AuthProvider`.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
  - `@/apps/client/src/components/ApiKeyModal.tsx`
  - `@/apps/client/src/pages/Dashboard.tsx`
  - `@/apps/client/src/pages/Auth.tsx`
  - `@/apps/client/src/pages/About.tsx`
  - `@/apps/client/src/pages/PrivacyPolicy.tsx`
  - `@/apps/client/src/pages/QuizBuilder.tsx`
  - `@/apps/client/src/pages/QuizPlayer.tsx`
  - `@/apps/client/src/pages/AttemptReview.tsx`
- Depended on by:
  - `@/apps/client/src/main.tsx`
