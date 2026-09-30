# Documentation: @/apps/client/src/pages/QuizBuilder.tsx

### Purpose
Provides the primary quiz generation interface supporting prompt-based searches with Google Search grounding and single document uploads (PDF/DOCX up to 20MB). Features calibrated depth selection, centered question count slider (min 5, max 50), dual execution mode selection, and a prominently positioned Recommended Scope Policy banner.

### What happens without it
Users cannot configure topic prompts, upload study documents, calibrate depth/difficulty, or generate AI quizzes.

### Key Controls & Ergonomics
- **Source Switcher**: Seamless toggle between Topic Prompt and Document Upload (20MB limit).
- **Centered Slider**: Centered layout with real-time question count badge, enforcing a minimum of 5 questions.
- **Scope Policy Banner**: Prominently positioned *below* the primary Generate Quiz button.
- **Evaluation Mode Selector**: Choice between immediate feedback (Learning Mode) and timed submission (Exam Mode).
- **Dark Mode & Coffee/Walnut Theme**: Supports dark/light themes with warm coffee neutrals and tactile hover/active animations.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - `@/apps/client/src/App.tsx`
