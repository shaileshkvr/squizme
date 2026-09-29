# Documentation: @/apps/client/src/pages/QuizPlayer.tsx

### Purpose
Provides the interactive quiz runner supporting all 4 question types with instantaneous feedback in Learning Mode and final submission in Exam Mode.

### What happens without it
Users cannot take quizzes, answer questions, or submit attempts.

### Key features
- Question card with dynamic layout for single choice, multiple choice, true/false, and short answer inputs.
- Learning Mode instant feedback banner with answer validation and explanation.
- Exam Mode silent answer capture with final submission.
- Sequential question navigation (Previous / Next / Submit).

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
