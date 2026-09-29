# Documentation: @/apps/client/src/pages/PrivacyPolicy.tsx

### Purpose
Publicly accessible privacy and data policies page detailing plain-English rules on local device API key storage, zero user and query data collection, and independent AI model terms.

### What happens without it
Users have no transparent reference explaining that API keys are stored locally on their device, that Squizme does not harvest queries, and that Google's model operates under independent terms.

### Sections
- Local-Only API Key Storage: Keys are encrypted with client-side AES-256-GCM and stored on the device, never on servers.
- Zero User & Query Data Collection: Squizme collects zero query or topical data from users.
- Third-Party AI Model Disclaimer: Clarifies that Google Gemini's data handling is between the user and Google, with no affiliation to Squizme as a company.
- Ephemeral Document Processing: 20MB in-memory parsing without permanent file retention.
- Storage & Tracking: Strict functional session persistence in localStorage with no marketing cookies.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
- Depended on by:
  - `@/apps/client/src/App.tsx`
