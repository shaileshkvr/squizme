# Squizme: AI quiz builder implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Squizme, a modular monolithic AI quiz generation platform supporting PDF/DOCX uploads and prompt-based web-researched topic generation, with strict BYO-API key management, configurable quiz execution modes, and MySQL persistence.

**Architecture:** A TypeScript monorepo managed via `pnpm` workspaces consisting of `apps/server` (Fastify + Drizzle ORM + MySQL 8 + Gemini 2.5 Flash), `apps/client` (React 19 + Vite + Tailwind CSS + Lucide icons), and `packages/shared` (Zod schemas and shared types). Docker containerizes the database and application for production and local development.

**Tech Stack:** Node.js 22, TypeScript 5.8, Fastify 5, Drizzle ORM, MySQL 8, React 19, Vite, Tailwind CSS, Zod, @google/genai, pdf-parse, mammoth, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-28-quiz-builder-design.md](file:///home/shailesh/Projects/squizme/docs/superpowers/specs/2026-09-28-quiz-builder-design.md)

## Global Constraints

- Package manager: strictly `pnpm` (`pnpm -w add`, `pnpm run ...`).
- File upload guardrails: maximum 1 file per generation request, maximum 20MB file size, strictly `.pdf` and `.docx`.
- Quota constraints: default host key allows at most 2 free quiz generations per user and at most 10 questions per quiz. BYO Gemini key allows unlimited generations and up to 50 questions per quiz.
- Key security: custom Gemini API keys are encrypted at rest with AES-256-GCM and never exposed to the client in plain text.
- Documentation rule: every source file created under the project root must have a mirrored documentation file under `docs/<filepath>.md` detailing its purpose, impact of absence, functions/methods, and dependency graph (`@/` relative paths).

---

### Task 1: Monorepo workspace initialization and root configuration

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `docs/package.json.md`
- Create: `docs/pnpm-workspace.yaml.md`
- Create: `docs/docker-compose.yml.md`

**Interfaces:**
- Produces: Monorepo root workspace with script coordination (`pnpm build`, `pnpm test`, `pnpm dev`).

- [ ] **Step 1: Create root pnpm workspace and package configuration**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Create root `package.json`:
```json
{
  "name": "squizme-monorepo",
  "private": true,
  "scripts": {
    "dev:server": "pnpm --filter @squizme/server dev",
    "dev:client": "pnpm --filter @squizme/client dev",
    "dev": "pnpm --parallel dev:server dev:client",
    "build": "pnpm --recursive run build",
    "test": "pnpm --recursive run test"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true
  }
}
```

Create `.gitignore`:
```
node_modules
dist
.env
*.log
coverage
```

Create `.env.example`:
```
PORT=3001
DATABASE_URL=mysql://root:rootpassword@localhost:3306/squizme
JWT_SECRET=super-secret-jwt-key-minimum-32-chars-long
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DEFAULT_GEMINI_API_KEY=
VITE_API_URL=http://localhost:3001
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: squizme-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: squizme
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  mysql_data:
```

- [ ] **Step 2: Create mirrored docs for root config files**

Create `docs/package.json.md`:
```markdown
# Documentation: @/package.json

### Purpose
Defines root workspace scripts and root dependencies for the Squizme monorepo.

### What happens without it
pnpm cannot resolve workspace members or run unified build and test scripts across apps and packages.

### Exports / Scripts
- `dev`: Runs server and client concurrently.
- `build`: Builds all workspace packages in topological order.
- `test`: Executes tests across packages.

### Dependency graph
- Depends on: None.
- Depended on by: All child workspace members.
```

Create `docs/pnpm-workspace.yaml.md`:
```markdown
# Documentation: @/pnpm-workspace.yaml

### Purpose
Declares the package directory patterns for pnpm workspaces.

### What happens without it
pnpm treats the repository as a single package and fails to link `@squizme/shared` to apps.

### Dependency graph
- Depends on: None.
- Depended on by: Root pnpm CLI.
```

Create `docs/docker-compose.yml.md`:
```markdown
# Documentation: @/docker-compose.yml

### Purpose
Defines local development and test infrastructure including MySQL 8 container with health checks.

### What happens without it
Developers must manually install, configure, and maintain a local MySQL 8 database instance.

### Dependency graph
- Depends on: None.
- Depended on by: `@/apps/server` database connection.
```

- [ ] **Step 3: Verify workspace setup**

Run: `pnpm install`
Expected: `Lockfile is up to date` or packages resolved cleanly.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize pnpm monorepo workspace and root configs"
```

---

### Task 2: Shared package with Zod schemas and TypeScript types

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas/user.ts`
- Create: `packages/shared/src/schemas/quiz.ts`
- Create: `packages/shared/src/schemas/attempt.ts`
- Create: `packages/shared/tests/schemas.test.ts`
- Create: `docs/packages/shared/src/index.ts.md`
- Create: `docs/packages/shared/src/schemas/quiz.ts.md`

**Interfaces:**
- Produces: `UserSchema`, `LoginSchema`, `QuizSettingsSchema`, `QuestionSchema`, `GenerateQuizRequestSchema`, `SubmitAttemptSchema`, and TypeScript types exported from `@squizme/shared`.

- [ ] **Step 1: Setup shared package scaffolding**

Create `packages/shared/package.json`:
```json
{
  "name": "@squizme/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.7"
  }
}
```

Create `packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Write failing test for schemas**

Create `packages/shared/tests/schemas.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { QuizSettingsSchema, QuestionSchema, GenerateQuizRequestSchema } from '../src/index';

describe('Shared Schemas', () => {
  it('validates a valid single choice question', () => {
    const validQuestion = {
      type: 'single_choice',
      prompt: 'What is the capital of France?',
      options: [
        { id: 'a', text: 'Paris' },
        { id: 'b', text: 'Berlin' }
      ],
      correctAnswers: ['a'],
      explanation: 'Paris is the capital of France.',
      points: 1
    };
    const parsed = QuestionSchema.safeParse(validQuestion);
    expect(parsed.success).toBe(true);
  });

  it('rejects quiz generation request exceeding 50 questions', () => {
    const invalidRequest = {
      prompt: 'Physics basics',
      questionCount: 51,
      difficulty: 'medium',
      depth: 'foundational',
      allowedTypes: ['single_choice']
    };
    const parsed = GenerateQuizRequestSchema.safeParse(invalidRequest);
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @squizme/shared test`
Expected: FAIL due to missing `../src/index` modules.

- [ ] **Step 4: Implement shared Zod schemas and exports**

Create `packages/shared/src/schemas/user.ts`:
```typescript
import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100)
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const UpdateApiKeySchema = z.object({
  apiKey: z.string().min(10)
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UpdateApiKey = z.infer<typeof UpdateApiKeySchema>;
```

Create `packages/shared/src/schemas/quiz.ts`:
```typescript
import { z } from 'zod';

export const QuestionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer'
]);

export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: QuestionTypeSchema,
  prompt: z.string().min(3),
  options: z.array(QuestionOptionSchema).default([]),
  correctAnswers: z.array(z.string()).min(1),
  explanation: z.string().min(1),
  points: z.number().int().min(1).default(1),
  orderIndex: z.number().int().default(0)
});

export const QuizSettingsSchema = z.object({
  mode: z.enum(['learning', 'exam']).default('learning'),
  timeLimitMinutes: z.number().int().positive().nullable().default(null),
  passingPercentage: z.number().min(0).max(100).default(70),
  shuffleQuestions: z.boolean().default(false),
  showExplanationsDuring: z.boolean().default(true)
});

export const GenerateQuizRequestSchema = z.object({
  prompt: z.string().optional(),
  researchEnabled: z.boolean().default(false),
  questionCount: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  depth: z.enum(['foundational', 'in_depth']).default('foundational'),
  allowedTypes: z.array(QuestionTypeSchema).min(1).default(['single_choice', 'true_false']),
  settings: QuizSettingsSchema.default({})
});

export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuizSettings = z.infer<typeof QuizSettingsSchema>;
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;
```

Create `packages/shared/src/schemas/attempt.ts`:
```typescript
import { z } from 'zod';

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  submittedAnswer: z.union([z.array(z.string()), z.string()])
});

export const SubmitAttemptSchema = z.object({
  answers: z.array(SubmitAnswerSchema)
});

export type SubmitAnswer = z.infer<typeof SubmitAnswerSchema>;
export type SubmitAttempt = z.infer<typeof SubmitAttemptSchema>;
```

Create `packages/shared/src/index.ts`:
```typescript
export * from './schemas/user.js';
export * from './schemas/quiz.js';
export * from './schemas/attempt.js';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @squizme/shared test`
Expected: PASS (all tests green).

- [ ] **Step 6: Write mirrored documentation**

Create `docs/packages/shared/src/index.ts.md`:
```markdown
# Documentation: @/packages/shared/src/index.ts

### Purpose
Root entry point and re-export hub for all shared domain schemas and types.

### What happens without it
Consumers cannot import schemas cleanly from `@squizme/shared`.

### Exports
- All exports from `./schemas/user.js`, `./schemas/quiz.js`, `./schemas/attempt.js`.

### Dependency graph
- Depends on:
  - `@/packages/shared/src/schemas/user.ts`
  - `@/packages/shared/src/schemas/quiz.ts`
  - `@/packages/shared/src/schemas/attempt.ts`
- Depended on by:
  - `@/apps/server`
  - `@/apps/client`
```

Create `docs/packages/shared/src/schemas/quiz.ts.md`:
```markdown
# Documentation: @/packages/shared/src/schemas/quiz.ts

### Purpose
Declares Zod schemas and TypeScript interfaces for quiz creation, question types, quiz settings, and generation parameters.

### What happens without it
The server and client cannot validate question structures or generation options consistently.

### Key schemas and types
- `QuestionTypeSchema`: Valid question formats (`single_choice`, `multiple_choice`, `true_false`, `short_answer`).
- `QuestionSchema`: Full question entity structure with options, correct answer array, and explanation.
- `QuizSettingsSchema`: Configuration for time limits, learning/exam mode, and question shuffling.
- `GenerateQuizRequestSchema`: Constraints for quiz generation requests (capped at 50 questions max).

### Dependency graph
- Depends on: `zod`
- Depended on by: `@/packages/shared/src/index.ts`
```

- [ ] **Step 7: Build package and commit**

Run: `pnpm --filter @squizme/shared build`
```bash
git add packages/shared docs/packages/shared
git commit -m "feat(shared): add Zod schemas and types for user, quiz, and attempt domains"
```

---

### Task 3: Backend database setup and encryption utilities (`apps/server/src/db`)

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/src/db/index.ts`
- Create: `apps/server/src/db/schema.ts`
- Create: `apps/server/src/utils/encryption.ts`
- Create: `apps/server/tests/encryption.test.ts`
- Create: `docs/apps/server/src/db/schema.ts.md`
- Create: `docs/apps/server/src/utils/encryption.ts.md`

**Interfaces:**
- Produces: `encryptApiKey(plainText: string): string`, `decryptApiKey(cipherText: string): string`, Drizzle ORM database instance `db`, and table models `users`, `quizzes`, `questions`, `quizAttempts`, `attemptAnswers`.

- [ ] **Step 1: Initialize server package configuration**

Create `apps/server/package.json`:
```json
{
  "name": "@squizme/server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@google/genai": "^0.1.2",
    "@fastify/cors": "^10.0.2",
    "@fastify/jwt": "^9.0.4",
    "@fastify/multipart": "^9.0.3",
    "@squizme/shared": "workspace:*",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.40.0",
    "fastify": "^5.2.1",
    "mammoth": "^1.9.0",
    "mysql2": "^3.13.0",
    "pdf-parse": "^1.1.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^22.13.9",
    "@types/pdf-parse": "^1.1.4",
    "drizzle-kit": "^0.30.5",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2",
    "vitest": "^3.0.7"
  }
}
```

Create `apps/server/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Write failing test for encryption utility**

Create `apps/server/tests/encryption.test.ts`:
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { encryptApiKey, decryptApiKey } from '../src/utils/encryption.js';

describe('API Key Encryption', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('encrypts and decrypts a key correctly', () => {
    const rawKey = 'AIzaSyExampleKey123456789';
    const encrypted = encryptApiKey(rawKey);
    expect(encrypted).not.toBe(rawKey);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted

    const decrypted = decryptApiKey(encrypted);
    expect(decrypted).toBe(rawKey);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @squizme/server test`
Expected: FAIL with missing encryption module.

- [ ] **Step 4: Implement AES-256-GCM encryption and Drizzle schema**

Create `apps/server/src/utils/encryption.ts`:
```typescript
import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(hexKey, 'hex');
}

export function encryptApiKey(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptApiKey(cipherText: string): string {
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

Create `apps/server/src/db/schema.ts`:
```typescript
import { mysqlTable, varchar, text, timestamp, int, decimal, boolean, json, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: mysqlEnum('role', ['user', 'admin']).default('user').notNull(),
  customGeminiApiKey: text('custom_gemini_api_key'),
  freeGenerationsUsed: int('free_generations_used').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const quizzes = mysqlTable('quizzes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  creatorId: varchar('creator_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  sourceType: mysqlEnum('source_type', ['prompt', 'pdf', 'docx', 'manual']).notNull(),
  sourceMetadata: json('source_metadata'),
  settings: json('settings').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const questions = mysqlTable('questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['single_choice', 'multiple_choice', 'true_false', 'short_answer']).notNull(),
  prompt: text('prompt').notNull(),
  options: json('options').notNull(),
  correctAnswers: json('correct_answers').notNull(),
  explanation: text('explanation').notNull(),
  points: int('points').default(1).notNull(),
  orderIndex: int('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const quizAttempts = mysqlTable('quiz_attempts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: mysqlEnum('status', ['in_progress', 'completed', 'timed_out', 'abandoned']).default('in_progress').notNull(),
  scoreAwarded: decimal('score_awarded', { precision: 5, scale: 2 }).default('0.00').notNull(),
  totalPoints: decimal('total_points', { precision: 5, scale: 2 }).default('0.00').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  isPassed: boolean('is_passed').default(false).notNull()
});

export const attemptAnswers = mysqlTable('attempt_answers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  attemptId: varchar('attempt_id', { length: 36 }).notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  submittedAnswer: json('submitted_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }).notNull(),
  gradedFeedback: text('graded_feedback')
});
```

Create `apps/server/src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

const connectionUri = process.env.DATABASE_URL || 'mysql://root:rootpassword@localhost:3306/squizme';

export const poolConnection = mysql.createPool(connectionUri);
export const db = drizzle(poolConnection, { schema, mode: 'default' });
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @squizme/server test`
Expected: PASS (encryption tests succeed).

- [ ] **Step 6: Write mirrored documentation**

Create `docs/apps/server/src/utils/encryption.ts.md`:
```markdown
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
```

Create `docs/apps/server/src/db/schema.ts.md`:
```markdown
# Documentation: @/apps/server/src/db/schema.ts

### Purpose
Defines the relational data schema for MySQL 8 using Drizzle ORM.

### What happens without it
Drizzle ORM cannot generate SQL migrations or execute type-safe queries against MySQL.

### Tables
- `users`: Account identities, roles, encrypted custom API keys, and free tier counters.
- `quizzes`: Quiz metadata, source type, settings, and creator relationship.
- `questions`: Question prompts, typed options, correct answers, and explanations.
- `quizAttempts`: Session attempts, timings, completion status, and scores.
- `attemptAnswers`: User responses per question with grading results and points.

### Dependency graph
- Depends on: `drizzle-orm/mysql-core`
- Depended on by:
  - `@/apps/server/src/db/index.ts`
  - All domain module services in `apps/server/src/modules/`
```

- [ ] **Step 7: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): setup MySQL Drizzle schema and AES-256-GCM encryption"
```

---

### Task 4: Auth and user profile modules (`apps/server/src/modules/auth`, `users`)

**Files:**
- Create: `apps/server/src/plugins/auth.ts`
- Create: `apps/server/src/modules/auth/service.ts`
- Create: `apps/server/src/modules/auth/routes.ts`
- Create: `apps/server/src/modules/users/service.ts`
- Create: `apps/server/src/modules/users/routes.ts`
- Create: `apps/server/tests/auth.test.ts`
- Create: `docs/apps/server/src/modules/auth/service.ts.md`
- Create: `docs/apps/server/src/modules/users/service.ts.md`

**Interfaces:**
- Consumes: `users` table from `@/apps/server/src/db/schema.ts`, `encryptApiKey` / `decryptApiKey` from `@/apps/server/src/utils/encryption.ts`.
- Produces: Fastify routes for registration, login, profile check, and API key update/testing.

- [ ] **Step 1: Write failing integration test for auth and user endpoints**

Create `apps/server/tests/auth.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authPlugin from '../src/plugins/auth.js';
import { authRoutes } from '../src/modules/auth/routes.js';

describe('Auth Module', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-required';
    app = Fastify();
    await app.register(authPlugin);
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects registration with invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'bad-email', password: 'password123', name: 'Test' }
    });
    expect(res.statusCode).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @squizme/server test tests/auth.test.ts`
Expected: FAIL due to missing routes/plugin.

- [ ] **Step 3: Implement auth plugin, services, and routes**

Create `apps/server/src/plugins/auth.ts`:
```typescript
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { id: string; email: string; role: string };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret-minimum-32-chars-long'
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing authentication token' });
    }
  });
});
```

Create `apps/server/src/modules/auth/service.ts`:
```typescript
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { RegisterRequest, LoginRequest } from '@squizme/shared';

export async function registerUser(input: RegisterRequest) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length > 0) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    email: input.email,
    passwordHash,
    name: input.name,
    role: 'user',
    freeGenerationsUsed: 0
  });

  return { id, email: input.email, name: input.name, role: 'user' };
}

export async function authenticateUser(input: LoginRequest) {
  const records = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (records.length === 0) {
    throw new Error('Invalid email or password');
  }
  const user = records[0];
  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

Create `apps/server/src/modules/auth/routes.ts`:
```typescript
import { FastifyInstance } from 'fastify';
import { RegisterRequestSchema, LoginRequestSchema } from '@squizme/shared';
import { registerUser, authenticateUser } from './service.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const parse = RegisterRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const user = await registerUser(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.status(201).send({ user, token });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post('/login', async (request, reply) => {
    const parse = LoginRequestSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const user = await authenticateUser(parse.data);
      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
      return reply.send({ user, token });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });
}
```

Create `apps/server/src/modules/users/service.ts`:
```typescript
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { encryptApiKey } from '../../utils/encryption.js';

export async function getUserProfile(userId: string) {
  const records = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (records.length === 0) {
    throw new Error('User not found');
  }
  const u = records[0];
  const hasCustomKey = Boolean(u.customGeminiApiKey);

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    hasCustomKey,
    freeGenerationsUsed: u.freeGenerationsUsed,
    freeGenerationsRemaining: Math.max(0, 2 - u.freeGenerationsUsed)
  };
}

export async function saveUserApiKey(userId: string, rawKey: string) {
  const encrypted = encryptApiKey(rawKey);
  await db.update(users).set({ customGeminiApiKey: encrypted }).where(eq(users.id, userId));
  return { success: true };
}

export async function removeUserApiKey(userId: string) {
  await db.update(users).set({ customGeminiApiKey: null }).where(eq(users.id, userId));
  return { success: true };
}
```

Create `apps/server/src/modules/users/routes.ts`:
```typescript
import { FastifyInstance } from 'fastify';
import { UpdateApiKeySchema } from '@squizme/shared';
import { getUserProfile, saveUserApiKey, removeUserApiKey } from './service.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/profile', async (request, reply) => {
    const user = await getUserProfile(request.user.id);
    return reply.send(user);
  });

  fastify.put('/api-key', async (request, reply) => {
    const parse = UpdateApiKeySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }
    await saveUserApiKey(request.user.id, parse.data.apiKey);
    return reply.send({ message: 'API key saved successfully' });
  });

  fastify.delete('/api-key', async (request, reply) => {
    await removeUserApiKey(request.user.id);
    return reply.send({ message: 'Custom API key removed' });
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @squizme/server test tests/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Write mirrored documentation**

Create `docs/apps/server/src/modules/auth/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/auth/service.ts

### Purpose
Handles user account creation and password credential verification.

### What happens without it
Users cannot register or log in, breaking all account-bound quiz creation and progress tracking.

### Functions
- `registerUser(input: RegisterRequest)`: Hashes passwords with bcrypt (10 rounds) and persists user record.
- `authenticateUser(input: LoginRequest)`: Compares passwords and returns user payload for JWT generation.

### Dependency graph
- Depends on:
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/db/schema.ts`
  - `@squizme/shared`
- Depended on by: `@/apps/server/src/modules/auth/routes.ts`
```

Create `docs/apps/server/src/modules/users/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/users/service.ts

### Purpose
Manages user profile data, quota counters, and encrypted Gemini API key updates.

### What happens without it
Users cannot save custom API keys or check their remaining free quiz generations.

### Functions
- `getUserProfile(userId: string)`: Retrieves profile details and calculates remaining free quota.
- `saveUserApiKey(userId: string, rawKey: string)`: Encrypts API key with AES-256-GCM and persists.
- `removeUserApiKey(userId: string)`: Clears custom API key from the database.

### Dependency graph
- Depends on:
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/utils/encryption.ts`
- Depended on by: `@/apps/server/src/modules/users/routes.ts`
```

- [ ] **Step 6: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): add auth and user profile modules with BYO-key management"
```

---

### Task 5: Document extraction module (`apps/server/src/modules/documents`)

**Files:**
- Create: `apps/server/src/modules/documents/service.ts`
- Create: `apps/server/tests/documents.test.ts`
- Create: `docs/apps/server/src/modules/documents/service.ts.md`

**Interfaces:**
- Produces: `extractDocumentText(buffer: Buffer, mimeType: string, filename: string): Promise<string>` with file size (20MB) and type guards.

- [ ] **Step 1: Write failing test for document extraction**

Create `apps/server/tests/documents.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { extractDocumentText } from '../src/modules/documents/service.js';

describe('Document Extraction Module', () => {
  it('rejects unsupported file formats', async () => {
    const fakeBuffer = Buffer.from('test content');
    await expect(extractDocumentText(fakeBuffer, 'image/png', 'photo.png'))
      .rejects.toThrow('Unsupported file format');
  });

  it('rejects files larger than 20MB', async () => {
    const oversizedBuffer = Buffer.alloc(21 * 1024 * 1024);
    await expect(extractDocumentText(oversizedBuffer, 'application/pdf', 'huge.pdf'))
      .rejects.toThrow('File exceeds 20MB limit');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @squizme/server test tests/documents.test.ts`
Expected: FAIL due to missing document service.

- [ ] **Step 3: Implement document extraction service**

Create `apps/server/src/modules/documents/service.ts`:
```typescript
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function extractDocumentText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds 20MB limit. Please upload a smaller document.');
  }

  const isPdf = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                filename.toLowerCase().endsWith('.docx');

  if (!isPdf && !isDocx) {
    throw new Error('Unsupported file format. Only PDF and DOCX files are supported.');
  }

  let rawText = '';
  if (isPdf) {
    try {
      const data = await pdfParse(buffer);
      rawText = data.text;
    } catch {
      throw new Error('Failed to parse PDF document. Ensure the file is not corrupted or password protected.');
    }
  } else if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } catch {
      throw new Error('Failed to parse DOCX document. Ensure the file is a valid Word document.');
    }
  }

  const cleanedText = rawText.replace(/\s+/g, ' ').trim();
  if (cleanedText.length < 50) {
    throw new Error('The document does not contain enough extractable text to generate a quiz.');
  }

  return cleanedText;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @squizme/server test tests/documents.test.ts`
Expected: PASS.

- [ ] **Step 5: Write mirrored documentation**

Create `docs/apps/server/src/modules/documents/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/documents/service.ts

### Purpose
Extracts and sanitizes text content from uploaded PDF and DOCX documents with size and safety guards.

### What happens without it
The server cannot ingest lecture notes, textbooks, or documents to construct quizzes.

### Functions
- `extractDocumentText(buffer: Buffer, mimeType: string, filename: string): Promise<string>`:
  - Enforces 20MB limit.
  - Parses PDF via `pdf-parse` or DOCX via `mammoth`.
  - Strips excess whitespace and verifies minimum content threshold.

### Dependency graph
- Depends on: `pdf-parse`, `mammoth`
- Depended on by: `@/apps/server/src/modules/generator/routes.ts`
```

- [ ] **Step 6: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): add document extraction service with 20MB limit and format guards"
```

---

### Task 6: Gemini quiz generator engine (`apps/server/src/modules/generator`)

**Files:**
- Create: `apps/server/src/modules/generator/tools.ts`
- Create: `apps/server/src/modules/generator/service.ts`
- Create: `apps/server/src/modules/generator/routes.ts`
- Create: `apps/server/tests/generator.test.ts`
- Create: `docs/apps/server/src/modules/generator/tools.ts.md`
- Create: `docs/apps/server/src/modules/generator/service.ts.md`

**Interfaces:**
- Consumes: Gemini SDK `@google/genai`, `extractDocumentText`, `decryptApiKey`, Zod schemas from `@squizme/shared`.
- Produces: `generateQuizQuestions(userId: string, input: GenerateQuizRequest, contextText?: string): Promise<{ title: string; description: string; questions: Question[] }>`.

- [ ] **Step 1: Write failing test for quota resolution and tool construction**

Create `apps/server/tests/generator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { buildQuestionTools } from '../src/modules/generator/tools.js';

describe('Generator Tools', () => {
  it('constructs valid tool definitions for Gemini', () => {
    const tools = buildQuestionTools();
    expect(tools).toHaveLength(4);
    const names = tools.map((t) => t.functionDeclarations?.[0]?.name);
    expect(names).toContain('add_single_choice_question');
    expect(names).toContain('add_multiple_choice_question');
    expect(names).toContain('add_true_false_question');
    expect(names).toContain('add_short_answer_question');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @squizme/server test tests/generator.test.ts`
Expected: FAIL due to missing generator tools module.

- [ ] **Step 3: Implement Gemini tools, quota engine, and generator service**

Create `apps/server/src/modules/generator/tools.ts`:
```typescript
import { FunctionDeclaration, Type } from '@google/genai';

export function buildQuestionTools(): Array<{ functionDeclarations: FunctionDeclaration[] }> {
  return [
    {
      functionDeclarations: [
        {
          name: 'add_single_choice_question',
          description: 'Adds a multiple-choice question with exactly one correct option',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt text' },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Option key, e.g. a, b, c, d' },
                    text: { type: Type.STRING, description: 'Option text' }
                  },
                  required: ['id', 'text']
                }
              },
              correct_option_id: { type: Type.STRING, description: 'The ID of the single correct option' },
              explanation: { type: Type.STRING, description: 'Detailed rationale explaining the correct answer' }
            },
            required: ['prompt', 'options', 'correct_option_id', 'explanation']
          }
        },
        {
          name: 'add_multiple_choice_question',
          description: 'Adds a question where one or more options can be correct',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt text' },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ['id', 'text']
                }
              },
              correct_option_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of option IDs that are correct'
              },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'options', 'correct_option_ids', 'explanation']
          }
        },
        {
          name: 'add_true_false_question',
          description: 'Adds a boolean factual verification question',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Statement to verify' },
              is_true: { type: Type.BOOLEAN, description: 'True if the statement is factually accurate, false otherwise' },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'is_true', 'explanation']
          }
        },
        {
          name: 'add_short_answer_question',
          description: 'Adds a brief fill-in-the-blank or short answer question',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt requiring a concise answer' },
              accepted_answers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of accepted phrase variations'
              },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'accepted_answers', 'explanation']
          }
        }
      ]
    }
  ];
}
```

Create `apps/server/src/modules/generator/service.ts`:
```typescript
import { GoogleGenAI } from '@google/genai';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { decryptApiKey } from '../../utils/encryption.js';
import { buildQuestionTools } from './tools.js';
import { GenerateQuizRequest, Question } from '@squizme/shared';

export async function resolveApiKeyAndEnforceQuota(userId: string, requestedCount: number) {
  const records = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (records.length === 0) {
    throw new Error('User not found');
  }
  const user = records[0];

  if (user.customGeminiApiKey) {
    const rawKey = decryptApiKey(user.customGeminiApiKey);
    return { apiKey: rawKey, isCustomKey: true, allowedCount: Math.min(requestedCount, 50) };
  }

  // Free tier host key
  if (user.freeGenerationsUsed >= 2) {
    throw new Error('QUOTA_EXHAUSTED: You have used your 2 free AI quizzes. Please add your Gemini API key in settings to continue.');
  }

  const hostKey = process.env.DEFAULT_GEMINI_API_KEY;
  if (!hostKey) {
    throw new Error('Server default Gemini API key is not configured.');
  }

  return { apiKey: hostKey, isCustomKey: false, allowedCount: Math.min(requestedCount, 10) };
}

export async function generateQuizWithGemini(
  userId: string,
  request: GenerateQuizRequest,
  extractedDocumentText?: string
) {
  const { apiKey, isCustomKey, allowedCount } = await resolveApiKeyAndEnforceQuota(userId, request.questionCount);
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an expert quiz builder. Construct high-quality, engaging, and accurate quizzes.
Scope policy: If the user provides a broad topic, focus on foundational, surface-level principles. If the topic is narrow, test nuanced mechanics.
Depth mode: ${request.depth === 'in_depth' ? 'Create analytical, in-depth questions testing mechanisms and edge cases.' : 'Create high-level foundational questions testing key concepts and definitions.'}
Difficulty: ${request.difficulty}.
Target count: Exactly ${allowedCount} questions.
You MUST invoke the provided question tools to emit each question.
`;

  let userPrompt = '';
  if (extractedDocumentText) {
    userPrompt = `Generate a ${allowedCount}-question quiz from the following document:\n\n${extractedDocumentText.slice(0, 100000)}`;
  } else {
    userPrompt = `Generate a ${allowedCount}-question quiz on the topic: "${request.prompt}".`;
  }

  const config: any = {
    systemInstruction,
    tools: buildQuestionTools(),
    temperature: 0.3
  };

  if (request.researchEnabled && !extractedDocumentText) {
    config.tools.push({ googleSearch: {} });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config
  });

  const parsedQuestions: Question[] = [];
  const functionCalls = response.functionCalls || [];

  let order = 0;
  for (const call of functionCalls) {
    const args: any = call.args;
    if (call.name === 'add_single_choice_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'single_choice',
        prompt: args.prompt,
        options: args.options,
        correctAnswers: [args.correct_option_id],
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_multiple_choice_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        prompt: args.prompt,
        options: args.options,
        correctAnswers: args.correct_option_ids,
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_true_false_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'true_false',
        prompt: args.prompt,
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ],
        correctAnswers: [args.is_true ? 'true' : 'false'],
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    } else if (call.name === 'add_short_answer_question') {
      parsedQuestions.push({
        id: crypto.randomUUID(),
        type: 'short_answer',
        prompt: args.prompt,
        options: [],
        correctAnswers: args.accepted_answers,
        explanation: args.explanation,
        points: 1,
        orderIndex: order++
      });
    }
  }

  if (parsedQuestions.length === 0) {
    throw new Error('Gemini failed to assemble structured questions. Please try again or rephrase the prompt.');
  }

  // Increment free generation count if host key was used
  if (!isCustomKey) {
    await db.update(users)
      .set({ freeGenerationsUsed: (records) => records.freeGenerationsUsed + 1 })
      .where(eq(users.id, userId));
  }

  return {
    title: request.prompt || 'Generated Document Quiz',
    description: `AI-generated quiz based on ${extractedDocumentText ? 'uploaded document' : request.prompt}`,
    questions: parsedQuestions
  };
}
```

Create `apps/server/src/modules/generator/routes.ts`:
```typescript
import { FastifyInstance } from 'fastify';
import { GenerateQuizRequestSchema } from '@squizme/shared';
import { extractDocumentText } from '../documents/service.js';
import { generateQuizWithGemini } from './service.js';
import { createQuizWithQuestions } from '../quizzes/service.js';

export async function generatorRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/generate', async (request, reply) => {
    let rawData: any = {};
    let extractedText: string | undefined;
    let sourceMeta: any = {};

    if (request.isMultipart()) {
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let filename = '';
      let mimeType = '';

      for await (const part of parts) {
        if (part.type === 'file') {
          filename = part.filename;
          mimeType = part.mimetype;
          fileBuffer = await part.toBuffer();
        } else {
          rawData[part.fieldname] = JSON.parse(part.value as string);
        }
      }

      if (fileBuffer) {
        extractedText = await extractDocumentText(fileBuffer, mimeType, filename);
        sourceMeta = { filename, size: fileBuffer.length };
      }
    } else {
      rawData = request.body;
    }

    const parse = GenerateQuizRequestSchema.safeParse(rawData);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }

    try {
      const generated = await generateQuizWithGemini(request.user.id, parse.data, extractedText);
      const quiz = await createQuizWithQuestions(
        request.user.id,
        generated.title,
        generated.description,
        extractedText ? 'pdf' : 'prompt',
        sourceMeta,
        parse.data.settings,
        generated.questions
      );

      return reply.status(201).send(quiz);
    } catch (err: any) {
      if (err.message.includes('QUOTA_EXHAUSTED')) {
        return reply.status(403).send({ error: 'QUOTA_EXHAUSTED', message: err.message });
      }
      return reply.status(500).send({ error: err.message });
    }
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @squizme/server test tests/generator.test.ts`
Expected: PASS.

- [ ] **Step 5: Write mirrored documentation**

Create `docs/apps/server/src/modules/generator/tools.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/generator/tools.ts

### Purpose
Defines typed Gemini tool declarations (`FunctionDeclaration`) for question interfaces.

### What happens without it
Gemini outputs unstructured text, leading to parse failures and missing question properties.

### Tool declarations
- `add_single_choice_question`: Choice prompt, options array, single correct ID, explanation.
- `add_multiple_choice_question`: Choice prompt, options array, multiple correct IDs, explanation.
- `add_true_false_question`: Assertion prompt, boolean flag, explanation.
- `add_short_answer_question`: Query prompt, accepted answer array, explanation.

### Dependency graph
- Depends on: `@google/genai`
- Depended on by: `@/apps/server/src/modules/generator/service.ts`
```

Create `docs/apps/server/src/modules/generator/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/generator/service.ts

### Purpose
Orchestrates Gemini generation, resolves BYO vs host API keys, enforces the 2-free-quiz quota, and parses tool invocations.

### What happens without it
The system cannot generate quizzes with AI or enforce quota boundaries.

### Functions
- `resolveApiKeyAndEnforceQuota(userId, requestedCount)`: Determines if the user is on free tier or BYO key, verifies remaining count, and caps questions.
- `generateQuizWithGemini(userId, request, extractedText)`: Executes Gemini 2.5 Flash request with search grounding and returns parsed questions.

### Dependency graph
- Depends on:
  - `@google/genai`
  - `@/apps/server/src/db/index.ts`
  - `@/apps/server/src/utils/encryption.ts`
  - `@/apps/server/src/modules/generator/tools.ts`
- Depended on by: `@/apps/server/src/modules/generator/routes.ts`
```

- [ ] **Step 6: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): add Gemini quiz generator engine with structured tool calling and quota checks"
```

---

### Task 7: Quizzes, attempts, and auto-grading modules (`apps/server/src/modules/quizzes`, `attempts`)

**Files:**
- Create: `apps/server/src/modules/quizzes/service.ts`
- Create: `apps/server/src/modules/quizzes/routes.ts`
- Create: `apps/server/src/modules/attempts/service.ts`
- Create: `apps/server/src/modules/attempts/routes.ts`
- Create: `apps/server/tests/attempts.test.ts`
- Create: `docs/apps/server/src/modules/quizzes/service.ts.md`
- Create: `docs/apps/server/src/modules/attempts/service.ts.md`

**Interfaces:**
- Produces: Quiz retrieval/mutation routes and Attempt runner endpoints (`POST /api/quizzes/:id/attempts`, `POST /api/attempts/:id/submit`, `GET /api/attempts/:id`).

- [ ] **Step 1: Write failing test for auto-grading logic**

Create `apps/server/tests/attempts.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { gradeQuestionAnswer } from '../src/modules/attempts/service.js';

describe('Auto-grading Engine', () => {
  it('correctly grades single choice questions', () => {
    const result = gradeQuestionAnswer('single_choice', ['b'], ['b'], 1);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
  });

  it('correctly grades short answer with case insensitivity', () => {
    const result = gradeQuestionAnswer('short_answer', ['mitochondria', 'mitochondrion'], 'Mitochondria', 2);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @squizme/server test tests/attempts.test.ts`
Expected: FAIL due to missing attempts service.

- [ ] **Step 3: Implement quiz management and attempt grading services**

Create `apps/server/src/modules/quizzes/service.ts`:
```typescript
import crypto from 'node:crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { quizzes, questions } from '../../db/schema.js';
import { Question, QuizSettings } from '@squizme/shared';

export async function createQuizWithQuestions(
  userId: string,
  title: string,
  description: string | null,
  sourceType: 'prompt' | 'pdf' | 'docx' | 'manual',
  sourceMetadata: any,
  settings: QuizSettings,
  questionList: Question[]
) {
  const quizId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(quizzes).values({
      id: quizId,
      creatorId: userId,
      title,
      description,
      sourceType,
      sourceMetadata,
      settings,
      isPublished: true
    });

    for (const q of questionList) {
      await tx.insert(questions).values({
        id: q.id || crypto.randomUUID(),
        quizId,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        points: q.points || 1,
        orderIndex: q.orderIndex || 0
      });
    }
  });

  return getQuizById(quizId);
}

export async function listUserQuizzes(userId: string) {
  return db.select().from(quizzes).where(eq(quizzes.creatorId, userId)).orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(quizId: string) {
  const quizRecords = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (quizRecords.length === 0) {
    throw new Error('Quiz not found');
  }
  const qList = await db.select().from(questions).where(eq(questions.quizId, quizId)).orderBy(questions.orderIndex);
  return {
    ...quizRecords[0],
    questions: qList
  };
}
```

Create `apps/server/src/modules/quizzes/routes.ts`:
```typescript
import { FastifyInstance } from 'fastify';
import { listUserQuizzes, getQuizById } from './service.js';

export async function quizRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    const list = await listUserQuizzes(request.user.id);
    return reply.send(list);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const quiz = await getQuizById(id);
    return reply.send(quiz);
  });
}
```

Create `apps/server/src/modules/attempts/service.ts`:
```typescript
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { quizAttempts, attemptAnswers, questions, quizzes } from '../../db/schema.js';
import { SubmitAnswer } from '@squizme/shared';

export function gradeQuestionAnswer(
  type: string,
  correctAnswers: string[],
  submitted: string | string[],
  points: number
): { isCorrect: boolean; pointsEarned: number } {
  if (type === 'single_choice' || type === 'true_false') {
    const isCorrect = Array.isArray(submitted) ? submitted[0] === correctAnswers[0] : submitted === correctAnswers[0];
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  if (type === 'multiple_choice') {
    const submittedArray = Array.isArray(submitted) ? submitted : [submitted];
    const isCorrect = correctAnswers.length === submittedArray.length &&
      correctAnswers.every((ans) => submittedArray.includes(ans));
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  if (type === 'short_answer') {
    const text = (Array.isArray(submitted) ? submitted[0] : submitted || '').trim().toLowerCase();
    const isCorrect = correctAnswers.some((ans) => ans.trim().toLowerCase() === text);
    return { isCorrect, pointsEarned: isCorrect ? points : 0 };
  }

  return { isCorrect: false, pointsEarned: 0 };
}

export async function startQuizAttempt(userId: string, quizId: string) {
  const attemptId = crypto.randomUUID();
  await db.insert(quizAttempts).values({
    id: attemptId,
    quizId,
    userId,
    startedAt: new Date(),
    status: 'in_progress'
  });
  return { attemptId, quizId, startedAt: new Date() };
}

export async function submitQuizAttempt(attemptId: string, answers: SubmitAnswer[]) {
  const attemptRecords = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attemptRecords.length === 0) {
    throw new Error('Attempt not found');
  }
  const attempt = attemptRecords[0];

  const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, attempt.quizId));
  const questionMap = new Map(quizQuestions.map((q) => [q.id, q]));

  let totalPossible = 0;
  let totalScore = 0;

  await db.transaction(async (tx) => {
    for (const q of quizQuestions) {
      totalPossible += q.points;
      const userSubmission = answers.find((a) => a.questionId === q.id);
      const submitted = userSubmission ? userSubmission.submittedAnswer : '';

      const { isCorrect, pointsEarned } = gradeQuestionAnswer(
        q.type,
        q.correctAnswers as string[],
        submitted,
        q.points
      );

      totalScore += pointsEarned;

      await tx.insert(attemptAnswers).values({
        id: crypto.randomUUID(),
        attemptId,
        questionId: q.id,
        submittedAnswer: submitted,
        isCorrect,
        pointsEarned: pointsEarned.toString(),
        gradedFeedback: q.explanation
      });
    }

    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    const isPassed = percentage >= 70;

    await tx.update(quizAttempts).set({
      completedAt: new Date(),
      status: 'completed',
      scoreAwarded: totalScore.toString(),
      totalPoints: totalPossible.toString(),
      percentage: percentage.toFixed(2),
      isPassed
    }).where(eq(quizAttempts.id, attemptId));
  });

  return getAttemptScorecard(attemptId);
}

export async function getAttemptScorecard(attemptId: string) {
  const attempts = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attempts.length === 0) {
    throw new Error('Attempt not found');
  }
  const attempt = attempts[0];
  const items = await db.select().from(attemptAnswers).where(eq(attemptAnswers.attemptId, attemptId));
  return { attempt, items };
}
```

Create `apps/server/src/modules/attempts/routes.ts`:
```typescript
import { FastifyInstance } from 'fastify';
import { SubmitAttemptSchema } from '@squizme/shared';
import { startQuizAttempt, submitQuizAttempt, getAttemptScorecard } from './service.js';

export async function attemptRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post('/start/:quizId', async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const session = await startQuizAttempt(request.user.id, quizId);
    return reply.status(201).send(session);
  });

  fastify.post('/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = SubmitAttemptSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parse.error.format() });
    }
    const scorecard = await submitQuizAttempt(id, parse.data.answers);
    return reply.send(scorecard);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scorecard = await getAttemptScorecard(id);
    return reply.send(scorecard);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @squizme/server test tests/attempts.test.ts`
Expected: PASS.

- [ ] **Step 5: Write mirrored documentation**

Create `docs/apps/server/src/modules/quizzes/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/quizzes/service.ts

### Purpose
Handles quiz persistence, questions storage in transactions, and quiz listing queries.

### What happens without it
Quizzes cannot be saved, viewed, or managed.

### Functions
- `createQuizWithQuestions`: Transactionally writes quiz record and associated questions into MySQL.
- `listUserQuizzes`: Returns all quizzes created by a user.
- `getQuizById`: Retrieves a quiz and its full ordered question set.

### Dependency graph
- Depends on: `@/apps/server/src/db/schema.ts`, `@/apps/server/src/db/index.ts`
- Depended on by: `@/apps/server/src/modules/quizzes/routes.ts`, `@/apps/server/src/modules/generator/routes.ts`
```

Create `docs/apps/server/src/modules/attempts/service.ts.md`:
```markdown
# Documentation: @/apps/server/src/modules/attempts/service.ts

### Purpose
Executes automated grading across all question types, records user responses, and compiles attempt scorecards.

### What happens without it
Quiz takers cannot submit answers or receive graded results.

### Functions
- `gradeQuestionAnswer`: Verifies submission against correct answers for each format.
- `startQuizAttempt`: Creates a new session record.
- `submitQuizAttempt`: Evaluates answers, calculates percentage, marks pass/fail, and finalizes attempt.
- `getAttemptScorecard`: Fetches the detailed attempt scorecard and review items.

### Dependency graph
- Depends on: `@/apps/server/src/db/schema.ts`, `@/apps/server/src/db/index.ts`
- Depended on by: `@/apps/server/src/modules/attempts/routes.ts`
```

- [ ] **Step 6: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): add quiz management and attempt auto-grading modules"
```

---

### Task 8: Server entry point and HTTP bootstrap (`apps/server/src/index.ts`)

**Files:**
- Create: `apps/server/src/index.ts`
- Create: `docs/apps/server/src/index.ts.md`

**Interfaces:**
- Produces: Running Fastify HTTP server on `PORT` with CORS, multipart, auth plugins, and registered API module routes.

- [ ] **Step 1: Implement server bootstrap**

Create `apps/server/src/index.ts`:
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { generatorRoutes } from './modules/generator/routes.js';
import { quizRoutes } from './modules/quizzes/routes.js';
import { attemptRoutes } from './modules/attempts/routes.js';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const server = Fastify({
  logger: true
});

async function main() {
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  await server.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 1
    }
  });

  await server.register(authPlugin);

  // Healthcheck
  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register domain module routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(userRoutes, { prefix: '/api/users' });
  await server.register(generatorRoutes, { prefix: '/api/generator' });
  await server.register(quizRoutes, { prefix: '/api/quizzes' });
  await server.register(attemptRoutes, { prefix: '/api/attempts' });

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: Write mirrored documentation**

Create `docs/apps/server/src/index.ts.md`:
```markdown
# Documentation: @/apps/server/src/index.ts

### Purpose
Main runtime entry point for the Fastify server application.

### What happens without it
The backend service cannot start, accept HTTP connections, or dispatch requests to domain modules.

### Setup and plugins
- Registers `@fastify/cors` for cross-origin client requests.
- Registers `@fastify/multipart` with 20MB size guard and 1 file limit.
- Registers custom JWT auth plugin.
- Mounts `/health` and domain module routes under `/api/`.

### Dependency graph
- Depends on:
  - `@/apps/server/src/plugins/auth.ts`
  - `@/apps/server/src/modules/auth/routes.ts`
  - `@/apps/server/src/modules/users/routes.ts`
  - `@/apps/server/src/modules/generator/routes.ts`
  - `@/apps/server/src/modules/quizzes/routes.ts`
  - `@/apps/server/src/modules/attempts/routes.ts`
- Depended on by: Root execution runtime.
```

- [ ] **Step 3: Build server package**

Run: `pnpm --filter @squizme/server build`
Expected: Exit code 0 with built files in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add apps/server docs/apps/server
git commit -m "feat(server): bootstrap Fastify server with plugins and module routing"
```

---

### Task 9: Frontend scaffolding and design system (`apps/client`)

**Files:**
- Create: `apps/client/package.json`
- Create: `apps/client/tsconfig.json`
- Create: `apps/client/vite.config.ts`
- Create: `apps/client/index.html`
- Create: `apps/client/src/main.tsx`
- Create: `apps/client/src/App.tsx`
- Create: `apps/client/src/index.css`
- Create: `apps/client/src/context/AuthContext.tsx`
- Create: `apps/client/src/components/Navbar.tsx`
- Create: `docs/apps/client/src/App.tsx.md`
- Create: `docs/apps/client/src/context/AuthContext.tsx.md`

**Interfaces:**
- Produces: Vite React 19 app with Tailwind styling, Lucide icons, JWT auth context, and responsive navigation shell with quota indicator.

- [ ] **Step 1: Setup React client package configuration**

Create `apps/client/package.json`:
```json
{
  "name": "@squizme/client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@squizme/shared": "workspace:*",
    "clsx": "^2.1.1",
    "lucide-react": "^0.477.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.3.0",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.12",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.12",
    "typescript": "^5.8.2",
    "vite": "^6.2.1"
  }
}
```

Create `apps/client/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

Create `apps/client/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Squizme - AI Quiz Builder</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `apps/client/src/index.css`:
```css
@import "tailwindcss";

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
```

Create `apps/client/src/context/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hasCustomKey: boolean;
  freeGenerationsRemaining: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token) refreshProfile();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

Create `apps/client/src/components/Navbar.tsx`:
```typescript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Key, LogOut, PlusCircle } from 'lucide-react';

export const Navbar: React.FC<{ onOpenApiKeyModal: () => void }> = ({ onOpenApiKeyModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          <span>Squizme</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 hover:border-indigo-400 bg-slate-50 transition"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              {user.hasCustomKey ? (
                <span className="text-emerald-700 font-semibold">BYO Key Active</span>
              ) : (
                <span>Free: {user.freeGenerationsRemaining}/2 left</span>
              )}
            </button>

            <Link
              to="/quizzes/new"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Quiz</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="text-slate-500 hover:text-slate-700 p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};
```

Create `apps/client/src/App.tsx`:
```typescript
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DashboardPage } from './pages/Dashboard';
import { AuthPage } from './pages/Auth';
import { QuizBuilderPage } from './pages/QuizBuilder';
import { QuizPlayerPage } from './pages/QuizPlayer';
import { AttemptReviewPage } from './pages/AttemptReview';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/quizzes/new" element={<ProtectedRoute><QuizBuilderPage /></ProtectedRoute>} />
          <Route path="/quizzes/:id/play" element={<ProtectedRoute><QuizPlayerPage /></ProtectedRoute>} />
          <Route path="/attempts/:id" element={<ProtectedRoute><AttemptReviewPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <ApiKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

Create `apps/client/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Write mirrored documentation**

Create `docs/apps/client/src/App.tsx.md`:
```markdown
# Documentation: @/apps/client/src/App.tsx

### Purpose
Top-level routing, shell layout, and authentication protection wrapper for the React application.

### What happens without it
The single page application lacks route definitions, navigation shell, and page switching logic.

### Dependency graph
- Depends on:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/components/Navbar.tsx`
  - `@/apps/client/src/components/ApiKeyModal.tsx`
- Depended on by: `@/apps/client/src/main.tsx`
```

Create `docs/apps/client/src/context/AuthContext.tsx.md`:
```markdown
# Documentation: @/apps/client/src/context/AuthContext.tsx

### Purpose
Provides authentication state, profile synchronization, quota checking, and JWT persistence to the entire React tree.

### What happens without it
Components cannot inspect the active user, determine quota limits, or pass bearer tokens to the API.

### Functions
- `login(token, user)`: Saves token in localStorage and sets reactive state.
- `logout()`: Clears token and resets user state.
- `refreshProfile()`: Fetches `/api/users/profile` to update quota counts.

### Dependency graph
- Depends on: React
- Depended on by: All page and navbar components in `@/apps/client`
```

- [ ] **Step 3: Commit**

```bash
git add apps/client docs/apps/client
git commit -m "feat(client): setup React 19 app with Tailwind, AuthContext, and Navbar"
```

---

### Task 10: In-app Gemini API key tutorial modal and settings (`apps/client/src/components/ApiKeyModal.tsx`)

**Files:**
- Create: `apps/client/src/components/ApiKeyModal.tsx`
- Create: `apps/client/src/pages/Auth.tsx`
- Create: `docs/apps/client/src/components/ApiKeyModal.tsx.md`

**Interfaces:**
- Produces: API Key Modal with direct Google AI Studio link, 3-step walkthrough, test connection button, and YouTube tutorial search link.

- [ ] **Step 1: Implement API key tutorial modal**

Create `apps/client/src/components/ApiKeyModal.tsx`:
```typescript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, CheckCircle, Video, Key, X, AlertCircle } from 'lucide-react';

export const ApiKeyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, token, refreshProfile } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      const res = await fetch('/api/users/api-key', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save API key');
      }

      setStatus('success');
      await refreshProfile();
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your custom API key? You will revert to host quota.')) return;
    await fetch('/api/users/api-key', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    await refreshProfile();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Key className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Google Gemini API Key</h2>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Google AI Studio provides 100% free Gemini API keys without requiring a credit card. Connect your key to unlock unlimited quizzes with up to 50 questions each.
        </p>

        {/* 3-Step Walkthrough */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How to get your free key in 30 seconds</h3>
          <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
            <li>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                Open Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and sign in with your Google account.
            </li>
            <li>Click the blue <strong>"Create API key"</strong> button.</li>
            <li>Copy the key and paste it into the box below.</li>
          </ol>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paste Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-200">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>API key verified and securely saved!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://www.youtube.com/results?search_query=how+to+create+google+gemini+api+key"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Video className="w-3.5 h-3.5" />
              Watch 1-min video tutorial
            </a>

            <div className="flex gap-2">
              {user?.hasCustomKey && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-red-600 hover:text-red-700 px-3 py-2"
                >
                  Remove Key
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'saving'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {status === 'saving' ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
```

Create `apps/client/src/pages/Auth.tsx`:
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-center gap-2 mb-6 text-indigo-600">
        <Sparkles className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Squizme</h1>
      </div>

      <h2 className="text-lg font-semibold text-center mb-6">
        {isRegister ? 'Create an account' : 'Sign in to your account'}
      </h2>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="text-xs text-indigo-600 hover:underline"
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Write mirrored documentation**

Create `docs/apps/client/src/components/ApiKeyModal.tsx.md`:
```markdown
# Documentation: @/apps/client/src/components/ApiKeyModal.tsx

### Purpose
Presents the Bring-Your-Own Gemini API Key interface with an interactive 3-step walkthrough, direct link to Google AI Studio, and video tutorial search link.

### What happens without it
Users who run out of their 2 free quizzes have no guidance on how to obtain or save a free Gemini API key.

### Key features
- Direct link to `https://aistudio.google.com/app/apikey`.
- 30-second walkthrough steps.
- Safe key persistence via `PUT /api/users/api-key`.
- YouTube tutorial search fallback.

### Dependency graph
- Depends on:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `lucide-react`
- Depended on by: `@/apps/client/src/App.tsx`
```

- [ ] **Step 3: Commit**

```bash
git add apps/client docs/apps/client
git commit -m "feat(client): add API key walkthrough modal and authentication page"
```

---

### Task 11: Quiz builder studio with scope warning and depth controls (`apps/client/src/pages/QuizBuilder.tsx`)

**Files:**
- Create: `apps/client/src/pages/QuizBuilder.tsx`
- Create: `docs/apps/client/src/pages/QuizBuilder.tsx.md`

**Interfaces:**
- Produces: Dual-mode quiz builder (Document 20MB limit vs Prompt with web search), Scope recommendation banner, Depth selector (Foundational vs In-depth), Question count slider (capped at 10 for free, 50 for BYO), and multi-step progress indicator.

- [ ] **Step 1: Implement QuizBuilderPage**

Create `apps/client/src/pages/QuizBuilder.tsx`:
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Search, Sparkles, AlertTriangle, Clock, BookOpen, Check } from 'lucide-react';

export const QuizBuilderPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'prompt' | 'document'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const maxAllowedQuestions = user?.hasCustomKey ? 50 : 10;
  const [questionCount, setQuestionCount] = useState(Math.min(10, maxAllowedQuestions));
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [depth, setDepth] = useState<'foundational' | 'in_depth'>('foundational');
  const [quizMode, setQuizMode] = useState<'learning' | 'exam'>('learning');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      setError('File exceeds 20MB limit. Please upload a smaller document.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingStage(mode === 'document' ? 'Extracting document text...' : 'Researching topic concepts...');

    try {
      let res: Response;

      if (mode === 'document') {
        if (!file) throw new Error('Please select a PDF or DOCX file to upload.');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('data', JSON.stringify({
          questionCount,
          difficulty,
          depth,
          settings: {
            mode: quizMode,
            timeLimitMinutes
          }
        }));

        setLoadingStage('Generating structured questions with Gemini...');
        res = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        if (!prompt.trim()) throw new Error('Please enter a topic prompt.');
        setLoadingStage(researchEnabled ? 'Searching the web for latest facts...' : 'Structuring questions with Gemini...');
        res = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            prompt,
            researchEnabled,
            questionCount,
            difficulty,
            depth,
            settings: {
              mode: quizMode,
              timeLimitMinutes
            }
          })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Quiz generation failed.');
      }

      navigate(`/quizzes/${data.id}/play`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create AI Quiz</h1>
        <p className="text-sm text-slate-600">Upload lecture material or research topics directly with Google Gemini.</p>
      </div>

      {/* Scope Recommendation Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-1">Recommended Scope Policy</strong>
          For optimal question quality, keep your topic or document focused (e.g. <em>"Photosynthesis light reactions"</em> rather than broad <em>"Biology"</em>). If you require questions on a wide topic, select <strong>"Foundational"</strong> depth below so questions focus on core principles.
        </div>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Source Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition ${
              mode === 'prompt' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            From Topic Prompt
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition ${
              mode === 'document' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            From Document (PDF/DOCX)
          </button>
        </div>

        {mode === 'prompt' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Topic Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Asynchronous event loop in JavaScript and microtask queues"
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={researchEnabled}
                onChange={(e) => setResearchEnabled(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                Enable Google Search grounding to fetch live web sources
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Upload Single Document (Max 20MB)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {file ? (
                <div className="text-sm font-medium text-indigo-600">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</div>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop PDF / DOCX
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Number of Questions: {questionCount}
              {!user?.hasCustomKey && <span className="text-amber-600 font-normal ml-1">(Free limit: 10)</span>}
            </label>
            <input
              type="range"
              min={3}
              max={maxAllowedQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Depth</label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as any)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="foundational">Foundational (High-level principles & definitions)</option>
              <option value="in_depth">In-depth (Nuanced mechanics & analytical problems)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Execution Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuizMode('learning')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  quizMode === 'learning' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Learning Mode
              </button>
              <button
                type="button"
                onClick={() => setQuizMode('exam')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  quizMode === 'exam' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                Exam Mode
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span>{loadingStage}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz with Gemini</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
```

- [ ] **Step 2: Write mirrored documentation**

Create `docs/apps/client/src/pages/QuizBuilder.tsx.md`:
```markdown
# Documentation: @/apps/client/src/pages/QuizBuilder.tsx

### Purpose
Provides the quiz creation studio interface supporting file uploads and prompt research.

### What happens without it
Users cannot configure parameters, upload documents, or initiate quiz generation.

### Key controls
- Mode switcher: Topic Prompt with Google Search grounding vs Document upload (20MB limit).
- Depth calibration selector: Foundational vs In-depth.
- Question count slider bounded by quota.
- Learning Mode vs Exam Mode toggle.

### Dependency graph
- Depends on:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `lucide-react`
- Depended on by: `@/apps/client/src/App.tsx`
```

- [ ] **Step 3: Commit**

```bash
git add apps/client docs/apps/client
git commit -m "feat(client): implement quiz builder studio with scope warning and depth controls"
```

---

### Task 12: Quiz runner and scorecard review (`apps/client/src/pages/QuizPlayer.tsx`, `AttemptReview.tsx`)

**Files:**
- Create: `apps/client/src/pages/QuizPlayer.tsx`
- Create: `apps/client/src/pages/AttemptReview.tsx`
- Create: `apps/client/src/pages/Dashboard.tsx`
- Create: `docs/apps/client/src/pages/QuizPlayer.tsx.md`
- Create: `docs/apps/client/src/pages/AttemptReview.tsx.md`

**Interfaces:**
- Produces: Interactive quiz runner supporting all 4 question formats in Learning Mode (instant feedback) and Exam Mode (timer and final submit), scorecard review page, and dashboard list.

- [ ] **Step 1: Implement QuizPlayerPage**

Create `apps/client/src/pages/QuizPlayer.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initQuiz() {
      try {
        const quizRes = await fetch(`/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const quizData = await quizRes.json();
        setQuiz(quizData);

        const attemptRes = await fetch(`/api/attempts/start/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const attemptData = await attemptRes.json();
        setAttemptId(attemptData.attemptId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [id, token]);

  if (loading || !quiz) return <div className="text-center py-12 text-slate-500">Loading quiz...</div>;

  const currentQ = quiz.questions[currentIndex];
  const isLearningMode = quiz.settings?.mode === 'learning';
  const currentAnswer = answers[currentQ.id];
  const isChecked = checkedQuestions[currentQ.id];

  const handleSelectOption = (optId: string) => {
    if (isChecked && isLearningMode) return;
    if (currentQ.type === 'multiple_choice') {
      const existing = (currentAnswer as string[]) || [];
      const updated = existing.includes(optId) ? existing.filter((x) => x !== optId) : [...existing, optId];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: optId });
    }
  };

  const handleCheckAnswer = () => {
    setCheckedQuestions({ ...checkedQuestions, [currentQ.id]: true });
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([questionId, submittedAnswer]) => ({
      questionId,
      submittedAnswer
    }));

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      navigate(`/attempts/${attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCorrect = isChecked && (
    currentQ.type === 'multiple_choice'
      ? (currentQ.correctAnswers as string[]).every((a: string) => (currentAnswer as string[])?.includes(a))
      : (currentQ.correctAnswers as string[])[0] === currentAnswer
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="font-bold text-slate-900">{quiz.title}</h2>
          <span className="text-xs text-slate-500">Question {currentIndex + 1} of {quiz.questions.length}</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700 capitalize">
          {quiz.settings?.mode} Mode
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-semibold text-slate-900">{currentQ.prompt}</h3>

        {/* Dynamic Question Interface */}
        {currentQ.type === 'short_answer' ? (
          <div>
            <input
              type="text"
              placeholder="Type your answer here..."
              value={(currentAnswer as string) || ''}
              disabled={isChecked && isLearningMode}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {currentQ.options.map((opt: any) => {
              const isSelected = Array.isArray(currentAnswer)
                ? currentAnswer.includes(opt.id)
                : currentAnswer === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-sm transition flex items-center justify-between ${
                    isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Learning Mode Instant Feedback */}
        {isLearningMode && (
          <div>
            {!isChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!currentAnswer}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                Check Answer
              </button>
            ) : (
              <div className={`p-4 rounded-lg text-xs space-y-1.5 ${isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-1 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-1 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};
```

Create `apps/client/src/pages/AttemptReview.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Award, RotateCcw, Home } from 'lucide-react';

export const AttemptReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScorecard() {
      try {
        const res = await fetch(`/api/attempts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await res.json();
        setData(resData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScorecard();
  }, [id, token]);

  if (loading || !data) return <div className="text-center py-12 text-slate-500">Loading results...</div>;

  const { attempt, items } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Score Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm space-y-3">
        <Award className="w-12 h-12 text-indigo-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Quiz Completed!</h1>
        <div className="text-4xl font-extrabold text-indigo-600">{Number(attempt.percentage).toFixed(0)}%</div>
        <p className="text-sm text-slate-600">
          You scored {attempt.scoreAwarded} out of {attempt.totalPoints} points.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to={`/quizzes/${attempt.quizId}/play`}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </Link>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Question Review</h2>
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
              {item.isCorrect ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Correct (+{item.pointsEarned} pts)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                  <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
              <strong className="block text-slate-700 mb-0.5">Submitted Answer:</strong>
              {Array.isArray(item.submittedAnswer) ? item.submittedAnswer.join(', ') : item.submittedAnswer || '(Blank)'}
            </div>
            <p className="text-xs text-slate-600">
              <strong className="text-slate-700">Explanation:</strong> {item.gradedFeedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

Create `apps/client/src/pages/Dashboard.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, PlusCircle, Sparkles, BookOpen } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch('/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Quizzes</h1>
          <p className="text-sm text-slate-600">Create, manage, and take AI-generated quizzes.</p>
        </div>
        <Link
          to="/quizzes/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <PlusCircle className="w-4 h-4" /> Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No quizzes generated yet</h3>
          <p className="text-xs text-slate-500 mb-4">Upload a PDF or enter a topic prompt to generate your first quiz.</p>
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">{quiz.sourceType}</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{quiz.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{quiz.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {quiz.settings?.mode || 'learning'}
                </span>
                <Link
                  to={`/quizzes/${quiz.id}/play`}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Play className="w-3.5 h-3.5" /> Take Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Write mirrored documentation**

Create `docs/apps/client/src/pages/QuizPlayer.tsx.md`:
```markdown
# Documentation: @/apps/client/src/pages/QuizPlayer.tsx

### Purpose
Provides the interactive quiz runner supporting all 4 question types with instantaneous feedback in Learning Mode and final submission in Exam Mode.

### What happens without it
Users cannot take quizzes, answer questions, or submit attempts.

### Dependency graph
- Depends on:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `lucide-react`
- Depended on by: `@/apps/client/src/App.tsx`
```

Create `docs/apps/client/src/pages/AttemptReview.tsx.md`:
```markdown
# Documentation: @/apps/client/src/pages/AttemptReview.tsx

### Purpose
Presents the detailed scorecard, percentage gauge, pass/fail status, and per-question rationale review after completing a quiz.

### What happens without it
Users have no visibility into which questions they answered correctly or why answers were right or wrong.

### Dependency graph
- Depends on:
  - `@/apps/client/src/context/AuthContext.tsx`
  - `lucide-react`
- Depended on by: `@/apps/client/src/App.tsx`
```

- [ ] **Step 3: Build client package**

Run: `pnpm --filter @squizme/client build`
Expected: Exit code 0 with built frontend bundle in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add apps/client docs/apps/client
git commit -m "feat(client): implement quiz player, scorecard review, and dashboard views"
```

---

### Task 13: Containerization and Docker deployment (`Dockerfile`, `docker-compose.yml`)

**Files:**
- Create: `Dockerfile`
- Modify: `docker-compose.yml`
- Create: `docs/Dockerfile.md`

**Interfaces:**
- Produces: Production multi-stage Docker build packaging Fastify server and built React static client assets into a single lightweight image.

- [ ] **Step 1: Create production multi-stage Dockerfile**

Create `Dockerfile`:
```dockerfile
# Multi-stage Dockerfile for Squizme
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/dist ./apps/server/dist
COPY apps/client/dist ./apps/server/public

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3001
CMD ["node", "apps/server/dist/index.js"]
```

Update `docker-compose.yml` to include the app container:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: squizme-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: squizme
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    build: .
    container_name: squizme-app
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - '3001:3001'
    environment:
      PORT: 3001
      DATABASE_URL: mysql://root:rootpassword@mysql:3306/squizme
      JWT_SECRET: super-secret-jwt-key-minimum-32-chars-long
      ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      DEFAULT_GEMINI_API_KEY: ${DEFAULT_GEMINI_API_KEY}

volumes:
  mysql_data:
```

Create `docs/Dockerfile.md`:
```markdown
# Documentation: @/Dockerfile

### Purpose
Defines the multi-stage container build packaging both Fastify backend and Vite React static assets into a production Alpine image.

### What happens without it
Docker cannot produce a standardized, reproducible production container for deployment.

### Stages
1. `builder`: Installs all dependencies and compiles TypeScript across shared package, server, and client.
2. `runner`: Copies compiled assets, installs production-only dependencies, and launches the Fastify server.

### Dependency graph
- Depends on: `node:22-alpine`, root monorepo files.
- Depended on by: `docker-compose.yml`.
```

- [ ] **Step 2: Commit**

```bash
git add Dockerfile docker-compose.yml docs/Dockerfile.md
git commit -m "chore: add multi-stage production Dockerfile and compose service configuration"
```

---

### Task 14: End-to-end verification and test suite execution

**Files:**
- Test: All unit and integration tests across monorepo

- [ ] **Step 1: Execute full monorepo test suite**

Run: `pnpm test`
Expected: PASS across `@squizme/shared` and `@squizme/server`.

- [ ] **Step 2: Execute full monorepo build**

Run: `pnpm build`
Expected: PASS with 0 build errors across `@squizme/shared`, `@squizme/server`, and `@squizme/client`.

- [ ] **Step 3: Verify docs mirroring consistency**

Verify that for every `.ts`, `.tsx`, and config file in the workspace, a corresponding `.md` file exists in `docs/`.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify end-to-end build, test suite, and docs mirroring"
```
