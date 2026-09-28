# Documentation: @/apps/server/src/utils/encryption.ts

### Purpose
Provides cryptographically secure AES-256-GCM encryption and decryption utilities for user-supplied Gemini API keys.

### What happens without it
API keys would be stored in plain text in MySQL, creating a major security vulnerability in case of database leakage.

### Functions
- `encryptApiKey(plainText: string): string`: Takes an API key and produces a serialized string in the format `iv:authTag:ciphertext`.
- `decryptApiKey(cipherText: string): string`: Validates the auth tag and decrypts the cipher text back to plain text.

### Dependency graph
- Depends on: `node:crypto`
- Depended on by:
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/server/src/modules/generator/service.ts`
