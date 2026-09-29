# Documentation: @/apps/client/src/pages/QuizPlayer.tsx

### Purpose
Provides the active quiz player interface, supporting both instant feedback (Learning Mode) and timed or quiet examination (Exam Mode).

### What happens without it
Users cannot take quizzes, submit answers, review explanations in real-time, or trigger scorecard evaluation.

### Key Features
- **Learning Mode vs Exam Mode**: Dynamically locks or unlocks rationales based on quiz configuration.
- **Responsive Layout**: Minimum 50px touch targets, comfortable reading typography (`text-base`), and fluid mobile padding.
- **Dark Mode Support**: High contrast borders and dark backgrounds.
- **Teal / Emerald Theme**: Distinctive colors for selected options and correct/incorrect results.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
