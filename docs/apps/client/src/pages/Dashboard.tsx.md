# Documentation: @/apps/client/src/pages/Dashboard.tsx

### Purpose
Serves as the primary user dashboard, listing previously generated quizzes with their creation dates, evaluation modes, source types, and quick-action links to play or generate new quizzes.

### What happens without it
Authenticated users cannot browse their personal quiz library, view quiz details, or trigger quiz attempts.

### Key Features
- **Responsive Layout**: Adapts between 1-column mobile cards and 3-column desktop grid.
- **Dark Mode Support**: High-contrast slate and teal palette with hover elevations.
- **Hero Create Action**: Direct button to open the quiz creation studio.
- **Empty State**: Friendly onboarding card directing users to upload their first document or prompt.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
