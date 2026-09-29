# Documentation: @/apps/client/src/components/ApiKeyModal.tsx

### Purpose
Provides a guided modal dialog for configuring client-side encrypted Google Gemini API keys (BYOK), featuring 3-step walkthrough instructions, video tutorial link, dark mode support, and backdrop click-outside dismissal.

### What happens without it
Users cannot enter custom Gemini API keys to unlock higher quiz generation quotas (up to 50 questions) without server persistence.

### Functions & States
- `isOpen`: Controls visibility of the modal.
- `onClose`: Callback when closing via 'X', Escape, or clicking the backdrop overlay.
- `handleSave`: Derives an AES-GCM key with PBKDF2, encrypts the raw key, and writes to `localStorage`.
- `handleRemove`: Clears the encrypted key from local storage.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - `@/apps/client/src/App.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
