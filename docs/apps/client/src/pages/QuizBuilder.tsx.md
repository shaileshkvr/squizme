# Documentation: @/apps/client/src/pages/QuizBuilder.tsx

### Purpose
Provides the primary quiz generation interface powered by Groq (`openai/gpt-oss-120b`). Features a unified prompt and source material input container with an in-input `+` file attachment button (temporarily disabled pending Cloudinary privacy integration), calibrated depth/difficulty selectors, centered question count slider (min 5, max 50), dual evaluation mode selectors, and a prominently positioned Recommended Scope Policy banner.

### What happens without it
Users cannot enter quiz topics or study notes, customize question framing, or trigger Groq assessment generation.

### Key Controls & Ergonomics
- **Unified Input Area**: Consolidates topic prompt, source notes, and question instructions into a single flexible container.
- **In-Input Attachment (`+` Icon)**: Shows disabled "Add file" option with informative notice regarding Cloudinary privacy pipeline status.
- **Centered Slider**: Centered layout with real-time question count badge, enforcing a minimum of 5 questions.
- **Scope Policy Banner**: Positioned below the primary Generate Quiz button for enhanced readability.
- **Evaluation Mode Selector**: Choice between immediate per-option feedback (Learning Mode) and timed submission (Exam Mode).

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - `@/apps/client/src/App.tsx`
