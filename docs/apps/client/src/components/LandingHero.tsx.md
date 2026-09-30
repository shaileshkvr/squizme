# Documentation: @/apps/client/src/components/LandingHero.tsx

### Purpose
Renders the primary landing hero section for unauthenticated visitors, featuring a punchy tagline and an interactive 3D question preview card that tilts on mouse movement.

### What happens without it
The landing page lacks a compelling value proposition and visual demo of active recall quizzing.

### Key Features
- **Punchy Tagline**: Left column displays "Stop re-reading notes. Start proving what you know." with clear CTAs.
- **3D Interactive Tilt Card**: Right column features a sample JavaScript runtime question card with 4 softly rounded options.
- **Hover-Driven 3D Perspective**: Rotates subtly (max ±7° on X/Y axes) based on cursor coordinates within the bounding box, returning smoothly to neutral on mouse leave.
- **Pedagogical Rationale Box**: Demonstrates the active recall microtask feedback mechanism directly in the hero.
- **Coffee & Walnut Palette**: Styled using the coffee/walnut palette tokens with dusty blue AI accents.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/pages/Landing.tsx`
