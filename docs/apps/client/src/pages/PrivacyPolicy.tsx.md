# Documentation: @/apps/client/src/pages/PrivacyPolicy.tsx

### Purpose
Publishes official data collection, encryption, and handling policies, specifically documenting local-only AES-GCM encrypted API key storage, zero query telemetry, and the independent third-party Google Gemini model terms.

### What happens without it
Users and self-hosters lack formal disclosures explaining how credentials, uploaded study files, and AI requests are processed and protected.

### Key Policy Areas
- **Local-Only Encrypted Keys**: Detailed explanation of client-side encryption without database persistence.
- **Zero Telemetry**: Guarantee that user queries, documents, and prompts are never collected or sold.
- **Third-Party Model Disclaimer**: Explicit legal distinction between Squizme and independent Google AI Studio data handling.
- **Ephemeral Processing**: In-memory parsing with immediate buffer teardown.
- **Dark Mode & Teal Accent**: Readable typography with accessible contrast in light and dark modes.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
- Depended on by:
  - `@/apps/client/src/App.tsx`
