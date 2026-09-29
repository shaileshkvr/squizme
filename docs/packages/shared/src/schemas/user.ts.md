# Documentation: @/packages/shared/src/schemas/user.ts

### Purpose
Defines Zod schemas and TypeScript types for user authentication, registration, login requests, and API key management.

### What happens without it
User registration, authentication requests, and API key updates cannot be validated contractually across client and server.

### Key schemas and types
- `RegisterRequestSchema` / `RegisterRequest`: Validates user registration fields (email format, password min length 8, name length 2-100).
- `LoginRequestSchema` / `LoginRequest`: Validates user login credentials (email format, non-empty password).
- `UpdateApiKeySchema` / `UpdateApiKey`: Validates user Gemini API key updates (minimum 10 characters).
- `ChangePasswordSchema` / `ChangePasswordRequest`: Validates current password and new password (min 8 chars).
- `UpdateProfileSchema` / `UpdateProfileRequest`: Validates display name updates (2-100 characters).

### Dependency graph
- Depends on: `zod`
- Depended on by:
  - `@/packages/shared/src/index.ts`
