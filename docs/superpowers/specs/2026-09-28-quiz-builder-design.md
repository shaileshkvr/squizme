# Squizme: AI quiz builder system design

**Date:** 2026-09-28  
**Status:** Validated design specification

---

## 1. Overview and goals

Squizme is a modern, modular AI quiz generator and interactive runner. It allows educators, students, and professionals to generate quizzes from uploaded documents (PDF and DOCX) or plain topic prompts with automated web research.

### Core features
- **Dual input sources:** Upload a document (single PDF or DOCX up to 20MB) or enter a topic prompt with optional Google Search grounding.
- **Scope and depth controls:** Friendly guidance prompts users to keep topics focused, with a selector for "Foundational / Surface-level" vs "In-depth / Deep Dive" questions.
- **BYO-API model with free tier:** Host provides 2 free quiz generations (max 10 questions each) using the default platform key. Users can supply their personal Google Gemini API key for unlimited generations up to 50 questions per quiz.
- **In-app Gemini onboarding guide:** Direct links to Google AI Studio, a 3-step walkthrough modal, and a fallback YouTube tutorial link.
- **Configurable quiz execution:** Quiz creators can toggle time limits, shuffle questions, and choose between Learning Mode (instant answer check and rationale) and Exam Mode (end-of-test grading with review scorecard).
- **Comprehensive progress and analytics:** MySQL tracks user accounts, generated quizzes, question banks, individual attempts, and per-question score breakdowns.

---

## 2. System architecture

The application is structured as a TypeScript monorepo using `pnpm` workspaces.

```
squizme/
├── apps/
│   ├── client/              # React 19, Vite, Tailwind CSS, Lucide icons
│   └── server/              # Fastify, Drizzle ORM, MySQL 8, Gemini SDK
├── packages/
│   └── shared/              # Shared Zod schemas, TypeScript types, question definitions
├── docker-compose.yml       # MySQL 8 service and app container definitions
├── Dockerfile               # Production multi-stage build
├── approach.md              # Architectural decisions and future Redis roadmap
└── docs/                    # Design specifications
```

### Module boundaries in `apps/server`
The backend follows a modular monolith pattern with explicit domain boundaries:
1. `modules/auth`: User registration, login, bcrypt password hashing, and JWT token issuance.
2. `modules/users`: Profile management, encrypted storage for custom Gemini API keys, and quota tracking.
3. `modules/documents`: Single-file upload handling (PDF and DOCX), size limit enforcement (20MB), text extraction via `pdf-parse` and `mammoth`, and text normalization.
4. `modules/generator`: Gemini API integration with structured function calling, question tool schemas, search grounding, depth calibration, and quota enforcement.
5. `modules/quizzes`: Quiz metadata, question ordering, publishing state, and configuration settings.
6. `modules/attempts`: Attempt session lifecycle, time tracking, answer submission, auto-grading, and score analytics.

---

## 3. Data model and MySQL schema

Drizzle ORM manages migrations and queries. Primary keys are UUIDs (`varchar(36)`).

### `users`
- `id`: `varchar(36)` (PK)
- `email`: `varchar(255)` (Unique, Indexed)
- `password_hash`: `varchar(255)`
- `name`: `varchar(100)`
- `role`: `enum('user', 'admin')` (Default: `'user'`)
- `custom_gemini_api_key`: `text` (Nullable, AES-256-GCM encrypted)
- `free_generations_used`: `int` (Default: 0)
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

### `quizzes`
- `id`: `varchar(36)` (PK)
- `creator_id`: `varchar(36)` (FK -> `users.id`, Cascade Delete)
- `title`: `varchar(255)`
- `description`: `text` (Nullable)
- `source_type`: `enum('prompt', 'pdf', 'docx', 'manual')`
- `source_metadata`: `json` (Stores filename, document word count, or research queries)
- `settings`: `json` (Zod schema: `QuizSettings`)
  - `mode`: `'learning' | 'exam'`
  - `time_limit_minutes`: `number | null` (null = untimed)
  - `passing_percentage`: `number` (Default: 70)
  - `shuffle_questions`: `boolean` (Default: false)
  - `show_explanations_during`: `boolean` (True for learning mode)
- `is_published`: `boolean` (Default: true)
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

### `questions`
- `id`: `varchar(36)` (PK)
- `quiz_id`: `varchar(36)` (FK -> `quizzes.id`, Cascade Delete)
- `type`: `enum('single_choice', 'multiple_choice', 'true_false', 'short_answer')`
- `prompt`: `text` (Markdown supported)
- `options`: `json` (Array of `{ id: string, text: string }` for choices; empty for short answer)
- `correct_answers`: `json` (Array of option IDs, or accepted string phrases for short answers)
- `explanation`: `text` (Detailed answer reasoning)
- `points`: `int` (Default: 1)
- `order_index`: `int`
- `created_at`: `timestamp`

### `quiz_attempts`
- `id`: `varchar(36)` (PK)
- `quiz_id`: `varchar(36)` (FK -> `quizzes.id`, Cascade Delete)
- `user_id`: `varchar(36)` (FK -> `users.id`, Cascade Delete)
- `started_at`: `timestamp`
- `completed_at`: `timestamp` (Nullable while in progress)
- `status`: `enum('in_progress', 'completed', 'timed_out', 'abandoned')`
- `score_awarded`: `decimal(5, 2)` (Default: 0.00)
- `total_points`: `decimal(5, 2)` (Default: 0.00)
- `percentage`: `decimal(5, 2)` (Default: 0.00)
- `is_passed`: `boolean` (Default: false)

### `attempt_answers`
- `id`: `varchar(36)` (PK)
- `attempt_id`: `varchar(36)` (FK -> `quiz_attempts.id`, Cascade Delete)
- `question_id`: `varchar(36)` (FK -> `questions.id`, Cascade Delete)
- `submitted_answer`: `json` (Selected option IDs or entered text)
- `is_correct`: `boolean`
- `points_earned`: `decimal(5, 2)`
- `graded_feedback`: `text` (Nullable)

---

## 4. Gemini tool-calling and quiz generator engine

### Model selection
Primary model: `gemini-2.5-flash` via `@google/genai` SDK. Fast, cost-efficient, with native support for tool calling, structured outputs, and Google Search grounding.

### Structured question tools
The generator invokes typed tools to assemble questions into the quiz:
1. `add_single_choice_question`:
   - `prompt`: Question text
   - `options`: 4 distinct choices `{ id: "a"|"b"|"c"|"d", text: string }`
   - `correct_option_id`: Correct choice ID
   - `explanation`: Clear rationale
2. `add_multiple_choice_question`:
   - `prompt`: Question text with multi-select note
   - `options`: 4 to 6 choices `{ id: string, text: string }`
   - `correct_option_ids`: Array of correct IDs
   - `explanation`: Explanation for why selected items are valid
3. `add_true_false_question`:
   - `prompt`: Statement to verify
   - `is_true`: Boolean
   - `explanation`: Context confirming truth or falsity
4. `add_short_answer_question`:
   - `prompt`: Direct prompt requiring brief answer
   - `accepted_answers`: Array of acceptable string variations (case-insensitive)
   - `explanation`: Correct concept explanation

### Scope calibration and prompt injection
When users create a quiz, the prompt template injects:
- **Scope instruction:** Instructs Gemini to evaluate topic breadth. If the topic is wide, it sticks to foundational principles. If narrow, it tests mechanics and applications.
- **Depth setting:**
  - `foundational`: High-level principles, definitions, core ideas.
  - `in_depth`: Nuanced problem solving, edge cases, formulas, analytical deductions.
- **Search grounding:** If enabled for prompt-based generation, Gemini fetches up-to-date facts from Google Search before calling the question tools.

---

## 5. File ingestion rules and guardrails

- **Limits:** Exactly 1 file per generation request. Maximum file size: 20MB.
- **Supported types:** `.pdf` (`application/pdf`) and `.docx` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- **Parsers:**
  - PDF: `pdf-parse` extracts raw text and metadata.
  - DOCX: `mammoth` extracts clean plain text.
- **Context window fitting:** Extracted text is trimmed, stripped of excessive whitespace, and capped at 250,000 words (well within Gemini's 1M token context window).
- **Error handling:** Empty files, password-protected PDFs, or corrupted files return clear client-friendly HTTP 422 errors.

---

## 6. BYO-API and quota management

### Quota rules
- **Host default key:**
  - Used when `users.custom_gemini_api_key` is null.
  - User can generate up to 2 free quizzes.
  - Question count capped at 10 questions per quiz.
  - When `free_generations_used >= 2`, quiz generation is locked until a key is added.
- **Custom Gemini API key (BYO):**
  - Stored in MySQL encrypted with AES-256-GCM.
  - Unlimited generations.
  - Up to 50 questions per quiz.

### In-app onboarding and tutorial flow
- Dedicated modal and `/settings` tab: **Connect your Gemini API key**.
- Direct button opening `https://aistudio.google.com/app/apikey`.
- 3-step illustrated walkthrough:
  1. Sign in with a Google account.
  2. Click **Create API key**.
  3. Copy the key and paste it into Squizme.
- **Test connection button:** Performs a lightweight ping (`gemini-2.5-flash` model list or 1-token prompt) to verify the key is active before persisting.
- **Fallback help link:** Button searching YouTube for `"how to create google gemini api key"`.

---

## 7. Frontend user experience (React 19)

### Navigation and layout
- Clean, responsive header with app logo, quiz navigation, API quota pill badge (`Free quizzes: 2/2`), and user profile avatar.

### Key views
1. **Dashboard (`/`):**
   - Quick stats: Total quizzes created, attempts taken, average score.
   - Active quiz grid with search, filter (by source type: PDF, Docx, Prompt), and delete actions.
   - Primary "Create Quiz" button.
2. **Quiz builder studio (`/quizzes/new`):**
   - Input tabs: **From Document** (drag-and-drop zone with 20MB cap) vs **From Prompt** (topic text area with web research toggle).
   - Friendly scope recommendation callout banner.
   - Question parameters: Count slider (10 max for free, 50 for BYO), Depth selector (Foundational vs In-depth), Question types checkboxes.
   - Quiz settings: Learning Mode vs Exam Mode, optional time limit in minutes, passing score threshold.
   - Live step-by-step generation loader ("Extracting text...", "Researching topic...", "Composing questions...").
3. **Interactive quiz player (`/quizzes/:id/play`):**
   - Clean distraction-free view with question index, question prompt in Markdown, and dynamic answer component.
   - **Learning Mode:** Shows option buttons, "Check Answer" button, instant green/red status, and an explanation card with rationale.
   - **Exam Mode:** Radio/checkbox selectors, timer countdown with visual urgency warning, question navigation drawer, and "Submit Exam" review modal.
4. **Scorecard and review (`/attempts/:id`):**
   - Hero score banner: percentage, points, pass/fail badge, time elapsed.
   - Full question breakdown showing user response, correct answer, and explanation.
   - Action buttons: "Retake Quiz", "Back to Dashboard".
5. **Settings and API keys (`/settings`):**
   - Profile details.
   - Gemini API Key section with quota status, encrypted key management, and the visual tutorial modal.

---

## 8. Containerization and environment

### Docker configuration
- `docker-compose.yml`:
  - `mysql`: MySQL 8.0 image with persistent volume and health check.
  - `app`: Node.js 22 alpine image running the built Fastify server and serving the React client assets.
- Environment variables:
  - `PORT`: Server port (default: 3001)
  - `DATABASE_URL`: MySQL connection string
  - `JWT_SECRET`: Secret for signing auth tokens
  - `ENCRYPTION_KEY`: 32-byte hex key for AES-256-GCM key encryption
  - `DEFAULT_GEMINI_API_KEY`: Platform host Gemini API key for free tier generations
  - `VITE_API_URL`: Client API base URL

---

## 9. Security, validation, and error handling

- **Password storage:** Passwords hashed with `bcrypt` (10 rounds).
- **API key protection:** User custom keys are never returned in plain text to the client; only a masked preview (e.g. `AIza...4X9Z`) is displayed in settings. Keys are encrypted at rest using AES-256-GCM.
- **Request validation:** All Fastify routes validate incoming payloads against shared Zod schemas.
- **File upload security:** File types are verified via MIME sniffing and file extensions; files are processed in-memory or in temporary buffers without executing any external binary.
- **Graceful degradation:** If Gemini hits rate limits (HTTP 429), the server returns a clean user-facing error message with retry timing.
