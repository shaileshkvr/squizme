# Documentation: @/apps/client/src/pages/AttemptReview.tsx

### Purpose
Renders the end-of-attempt scorecard, summarizing total points, percentage scored, and a question-by-question review with explanations and submitted answers.

### What happens without it
Users cannot inspect their final quiz performance, see which questions were missed, or learn from corrective feedback.

### Key Features
- **Hero Performance Card**: Bold score percentage and points tally with quick actions to return to dashboard or retake the quiz.
- **Answer Comparison**: Clear rendering of submitted answers against correctness badges.
- **Dark Mode Support**: High-contrast slate card styling with accessible text colors.
- **Teal / Emerald Accents**: Visual feedback on score and passing status.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
