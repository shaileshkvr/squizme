# Documentation: @/apps/client/src/pages/Dashboard.tsx

### Purpose
Home dashboard displaying all quizzes created by the user, mode badges, source types, and shortcuts to start taking quizzes or create a new quiz.

### What happens without it
Users have no landing view to see past quizzes or launch quiz sessions.

### Key features
- Grid of authored quiz cards with metadata (creation date, source type, title, description, mode).
- Empty state with direct "Get Started" call to action.
- "Create New Quiz" header action.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
