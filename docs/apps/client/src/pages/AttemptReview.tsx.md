# Documentation: @/apps/client/src/pages/AttemptReview.tsx

### Purpose
Presents the detailed scorecard, percentage score, pass/fail status, and per-question rationale review after completing a quiz.

### What happens without it
Quiz takers cannot inspect their final score, see which questions were right or wrong, or read pedagogical explanations.

### Key features
- Hero score banner showing total points and percentage.
- Retake Quiz and Dashboard navigation buttons.
- Question-by-question breakdown showing user's answer vs correct feedback and explanation.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
