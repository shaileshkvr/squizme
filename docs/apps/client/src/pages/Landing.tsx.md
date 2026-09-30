# Documentation: @/apps/client/src/pages/Landing.tsx

### Purpose
Serves as the root landing page for visitors without an active authentication session, presenting product capabilities, architectural highlights, and zero-data privacy guarantees.

### What happens without it
Unauthenticated users accessing the root `/` URL would either see an empty screen or be abruptly redirected to the login form.

### Key Features
- **Integrated Hero Component**: Houses `LandingHero` with the punchy tagline and interactive 3D tilted question card.
- **Core Feature Matrix**: Highlights 20MB document ingestion, Google Search grounding, and dual learning/exam modes.
- **Privacy & BYO-Key Explainer**: Communicates client-side AES-256-GCM encryption and zero server-side storage of keys or queries.
- **Bottom Call to Action**: Direct registration link to jumpstart account creation.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/apps/client/src/components/LandingHero.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
