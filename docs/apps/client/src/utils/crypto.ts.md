# Documentation: @/apps/client/src/utils/crypto.ts

### Purpose
Provides client-side cryptographic functions using the browser's native Web Crypto API (`window.crypto.subtle`) to encrypt and store personal Google Gemini API keys locally on the device (AES-256-GCM) without persisting them to server databases.

### What happens without it
The application either stores raw API keys in plain text in localStorage or must transmit and persist them to a remote server database.

### Functions
- `saveLocalApiKey(apiKey: string): Promise<void>`: Derives a 256-bit AES-GCM key via PBKDF2 (100,000 iterations), encrypts the API key with a random 12-byte initialization vector, and stores the ciphertext in `localStorage`.
- `getLocalApiKey(): Promise<string | null>`: Decrypts the stored payload and returns the raw key in memory.
- `removeLocalApiKey(): void`: Erases the encrypted key payload from `localStorage`.
- `hasLocalApiKey(): boolean`: Synchronously checks if an encrypted key exists in device storage.

### Dependency graph
- Depends on:
  - Web Crypto API (`window.crypto.subtle`)
- Depended on by:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/components/ApiKeyModal.tsx`
  - `@/apps/client/src/pages/QuizBuilder.tsx`
