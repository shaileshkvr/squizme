# Documentation: @/apps/client/src/components/ApiKeyModal.tsx

### Purpose
Provides a guided modal dialog for configuring client-side encrypted Groq API keys (BYOK), featuring walkthrough instructions linking to Groq Cloud, project API settings guidance, dark mode support, and backdrop click-outside dismissal.

### What happens without it
Users cannot enter custom Groq API keys to unlock higher quiz generation quotas (up to 50 questions) without server persistence.

### Functions & States
- `isOpen`: Controls visibility of the modal.
- `onClose`: Callback when closing via 'X', Escape, or clicking the backdrop overlay.
- `handleSave`: Validates key format, derives an AES-GCM key with PBKDF2, encrypts the raw key, and writes to `localStorage`.
- `handleRemove`: Clears the encrypted key from local storage and updates user profile state.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - `@/apps/client/src/App.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
