# Documentation: @/apps/client/src/pages/PrivacyPolicy.tsx

### Purpose
Publicly accessible privacy and data policies page detailing plain-English rules on user credentials, AES-256-GCM API key encryption, in-memory document parsing, and zero third-party tracking.

### What happens without it
Users have no transparent reference for how their documents, personal Gemini API keys, or account credentials are protected.

### Sections
- Information We Collect: account metadata, bcrypt password hashing.
- Bring-Your-Own API Key Security: AES-256-GCM encryption at rest, memory-only decryption, one-click deletion.
- Document Uploads & Retention: in-memory 20MB extraction, zero permanent file storage.
- Third-Party AI Services: Google Gemini API compliance and TLS encryption.
- Storage & Tracking: strict functional JWT storage without marketing pixels.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
- Depended on by:
  - `@/apps/client/src/App.tsx`
