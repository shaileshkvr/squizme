# Documentation: @/apps/client/src/utils/crypto.ts

### Purpose
Provides client-side cryptographic functions using the browser's native Web Crypto API (`window.crypto.subtle`) to encrypt and store personal Groq API keys locally on the device (AES-256-GCM) with legacy migration support and zero server database persistence.

### What happens without it
The application either stores raw API keys in plain text in localStorage or must transmit and persist them to a remote server database.

### Functions
- `saveLocalApiKey(apiKey: string): Promise<void>`: Derives a 256-bit AES-GCM key via PBKDF2 (100,000 iterations), encrypts the Groq API key with a random 12-byte initialization vector, stores the ciphertext in `localStorage` under `squizme_encrypted_groq_key`, and removes legacy keys.
- `getLocalApiKey(): Promise<string | null>`: Decrypts the stored payload and returns the raw key in volatile memory (falling back to legacy storage if present).
- `removeLocalApiKey(): void`: Erases both current and legacy encrypted key payloads from `localStorage`.
- `hasLocalApiKey(): boolean`: Synchronously checks if an encrypted key exists in device storage.

### Dependency graph
- Depends on:
  - Web Crypto API (`window.crypto.subtle`)
- Depended on by:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/components/ApiKeyModal.tsx`
  - `@/apps/client/src/pages/QuizBuilder.tsx`
