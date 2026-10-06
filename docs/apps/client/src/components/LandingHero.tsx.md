# Documentation: @/apps/client/src/components/LandingHero.tsx

### Purpose
Renders the primary landing hero section for unauthenticated visitors, featuring a punchy tagline and an interactive, grounded question card demonstrating active recall quizzing with live selection, validation, and rationales.

### What happens without it
The landing page lacks a compelling value proposition and visual demo of active recall quizzing.

### Key Features
- **Punchy Tagline**: Left column displays "Stop re-reading notes. Start proving what you know." with clear CTAs.
- **Interactive Grounded Assessment Card**: Right column features the "How to survive Mircoslop?" question card sitting flat with zero jarring tilt or motion artifacts.
- **Micro-Interactions**: Options scale slightly on hover (`hover:scale-[1.015]`), glow with subtle borders/shadows, and compress on press (`active:scale-[0.99]`).
- **Submit Validation**: Displays an inline alert if the user attempts to submit without picking an option.
- **Persistent State**: Answers are preserved in `localStorage` so the assessment is answered once, with a "Try again" action to reset and re-explore.
- **Nuanced Multi-Tier Rationales**:
  - Option 4 ("Both 1 and 2"): Full credit (`+1 pt · Correct`) with positive reinforcement.
  - Option 1 or 2 ("Switch to MAC" / "Switch to Linux"): Partial answer badge (`Partial answer`) highlighting that both OSes are valid escapes from Microslop.
  - Option 3 ("Debloat Windows"): Explains that Windows aggressively tracks users despite debloating.
- **Coffee & Walnut Palette**: Styled using the coffee/walnut palette tokens with dusty blue AI accents.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/pages/Landing.tsx`
