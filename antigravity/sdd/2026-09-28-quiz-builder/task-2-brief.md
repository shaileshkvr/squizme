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

