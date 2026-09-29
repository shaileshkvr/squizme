# Documentation: @/README.md

### Purpose
Serves as the root project entry point and public landing document for Squizme. Outlines core features (dual ingestion modes, depth calibration, dual player modes), architecture, self-hosting steps, and the privacy/openness model (client-side AES-GCM BYO key encryption, zero server query logging, transparent model boundary).

### What happens without it
Developers, contributors, and self-hosters lack quick-start instructions, environment configuration details, architectural maps, test credentials, and clear documentation on privacy policies and quota rules.

### Structure & Sections
- **Overview**: Core value proposition and summary.
- **Key Features**: Ingestion methods, question types, depth calibration, and player modes.
- **Openness & Privacy Architecture**: Detailed explanation of client-side encryption, ephemeral memory routing, zero query retention, and model boundaries.
- **Monorepo Architecture**: Folder directory layout and responsibility breakdown.
- **Getting Started**: Step-by-step local development setup including database commands and pre-seeded credentials.
- **Running with Docker**: Production container deployment instructions.
- **Documentation Standard**: Explanation of the 1:1 `docs/` mirroring policy.

### Dependency graph
- Depends on:
  - Repository structure across `apps/`, `packages/`, `docs/`, and `antigravity/`
- Depended on by:
  - Repository viewers, developers, and operators
