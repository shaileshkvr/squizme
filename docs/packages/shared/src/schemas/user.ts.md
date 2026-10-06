# Documentation: @/packages/shared/src/schemas/user.ts

### Purpose
Defines Zod schemas, helper functions, and TypeScript types for user authentication, registration, login requests, password changing, and API key management.

### What happens without it
User registration, authentication requests, and API key updates cannot be validated contractually across client and server.

### Key schemas and types
- `validatePassword(password: string): string | null`: Reusable validation helper verifying password rules (at least 8 characters, at least 1 letter, at least 1 number, at least 1 special character; no uppercase/lowercase distinction required).
- `PasswordSchema`: Zod string refinement enforcing the 8-character, letter, number, and special character rules with detailed error messages.
- `RegisterRequestSchema` / `RegisterRequest`: Validates user registration fields (email format, `PasswordSchema`, required `firstName` 1-100 chars, optional `lastName` max 100 chars).
- `LoginRequestSchema` / `LoginRequest`: Validates user login credentials (email format, non-empty password).
- `UpdateApiKeySchema` / `UpdateApiKey`: Validates user Gemini API key updates (minimum 10 characters).
- `ChangePasswordSchema` / `ChangePasswordRequest`: Validates current password (non-empty) and new password (`PasswordSchema`).
- `UpdateProfileSchema` / `UpdateProfileRequest`: Validates user profile updates (required `firstName` 1-100 chars, optional `lastName` max 100 chars).

### Dependency graph
- Depends on: `zod`
- Depended on by:
  - `@/packages/shared/src/index.ts`
  - `@/apps/server/src/modules/auth/routes.ts`
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/client/src/pages/Auth.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
