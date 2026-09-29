# Squizme

Squizme is a privacy-first AI quiz builder that generates structured assessments from documents (PDF/DOCX) or plain topic prompts using Gemini 2.5 Flash.

---

## Key Features

### 1. Dual Ingestion Modes
- **Document-Based Quizzes**: Upload PDF or DOCX files (up to 20MB, 1 document per quiz). Text extraction isolates clean content and builds questions directly from your source material.
- **Prompt & Search Grounding**: Enter any topic with optional Google Search grounding to retrieve current, factual information beyond the model's base training cutoff.

### 2. Depth Calibration & Question Controls
- **Foundational vs In-depth**: Choose foundational questions for surface-level review or in-depth questions for advanced concept verification.
- **Multiple Question Formats**: Generates single choice, multi-select, true/false, and short answer formats with structured rationales for every option.
- **Configurable Limits**: Generate up to 10 questions per quiz on the default free tier, or scale up to 50 questions per quiz using a personal API key.

### 3. Dual Player Modes
- **Learning Mode**: Instant feedback after every selection, revealing the correct answer, detailed rationales, and concept breakdowns immediately.
- **Exam Mode**: Formal evaluation setting with an active countdown timer, no interim hints, and an end-of-exam scorecard detailing percentages, question-by-question review, and performance summaries.

---

## Openness & Privacy Architecture

Squizme is built on strict data boundaries:

### Client-Side Key Encryption (BYOK)
- Users can bring their own Google Gemini API key to bypass default quota caps.
- Personal keys are **encrypted directly in your browser** using the Web Crypto API (AES-256-GCM with PBKDF2 key derivation) and stored in `localStorage`.
- Your key is never stored in the Squizme PostgreSQL database. When you generate a quiz, the key is passed ephemerally via HTTP headers (`x-gemini-api-key`) in volatile memory to execute the Gemini SDK request.

### Zero Telemetry & Query Storage
- We do not log, retain, or train on your quiz prompts, uploaded files, or generated questions.
- Generation requests execute statelessly. Uploaded files are parsed in memory or temporary disk buffers and discarded immediately after processing.

### Model Transparency
- AI inference runs on Google's Gemini API. Squizme acts as an orchestrator and UI.
- Model data handling adheres strictly to Google AI Studio's terms and privacy policies. Squizme has no affiliation with Google beyond consuming the public API.

---

## Monorepo Architecture

Squizme uses a TypeScript `pnpm` monorepo:

```
squizme/
├── apps/
│   ├── client/          # Vite + React 19 + Tailwind CSS SPA
│   └── server/          # Fastify 5 + Drizzle ORM + PostgreSQL 16
├── packages/
│   └── shared/          # Shared Zod schemas, TypeScript types, and contracts
├── docs/                # 1:1 mirrored documentation for all codebase files
└── antigravity/         # Project roadmaps, task logs, and architectural records
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.19.0 (v22 recommended)
- `pnpm` >= 9.x
- Docker & Docker Compose (for PostgreSQL)

### 1. Installation
```bash
git clone https://github.com/shailesh/squizme.git
cd squizme
pnpm install
```

### 2. Environment Configuration
Create an `.env` file in `apps/server/`:
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/squizme
JWT_SECRET=squizme-super-secret-jwt-key-minimum-32-chars-long
DEFAULT_GEMINI_API_KEY=your_gemini_api_key_here
ENCRYPTION_KEY=12345678901234567890123456789012
```

### 3. Database Setup
Start the local PostgreSQL container:
```bash
docker compose up -d postgres
```

Run schema migrations and seed the default test account:
```bash
pnpm --filter @squizme/server db:migrate
pnpm --filter @squizme/server db:seed
```

#### Pre-Seeded Test Credentials
- **Email**: `testacc404@gmail.com`
- **Password**: `#test-user-404`

### 4. Running Locally
Run both backend and frontend concurrently:
```bash
# Terminal 1 - Backend API (http://localhost:3001)
pnpm --filter @squizme/server dev

# Terminal 2 - Frontend SPA (http://localhost:5173)
pnpm --filter @squizme/client dev
```

---

## Running with Docker
To build and run the full production application in a unified container with PostgreSQL:
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:3001`.

---

## Documentation Standard
Every source file in this repository is mirrored 1:1 in the [`docs/`](./docs) directory, answering:
1. Why the file exists
2. What happens without it
3. Exported functions, routes, or interfaces
4. Inbound and outbound dependency graphs

---

## License
MIT
