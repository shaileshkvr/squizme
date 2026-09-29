# Documentation: @/apps/client/src/pages/QuizBuilder.tsx

### Purpose
Provides the quiz creation studio interface supporting file uploads and prompt research.

### What happens without it
Users cannot configure parameters, upload documents, or initiate quiz generation.

### Key controls
- Mode switcher: Topic Prompt with Google Search grounding vs Document upload (20MB limit).
- Depth calibration selector: Foundational vs In-depth.
- Question count slider bounded by quota.
- Learning Mode vs Exam Mode toggle.
- Scope recommendation callout banner.

### Dependency graph
- Depends on:
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
