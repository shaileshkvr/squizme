import { describe, it, expect, beforeAll } from 'vitest';
import { buildQuestionTools } from '../src/modules/generator/tools.js';
import { resolveApiKeyAndEnforceQuota } from '../src/modules/generator/service.js';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';
import { encryptApiKey } from '../src/utils/encryption.js';
import crypto from 'node:crypto';

describe('Generator Module', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.DEFAULT_GEMINI_API_KEY = 'test-default-host-gemini-key';
  });

  it('constructs valid tool definitions for Gemini', () => {
    const tools = buildQuestionTools();
    expect(tools).toHaveLength(1);
    const names = tools[0].functionDeclarations?.map((f) => f.name);
    expect(names).toContain('add_single_choice_question');
    expect(names).toContain('add_multiple_choice_question');
    expect(names).toContain('add_true_false_question');
    expect(names).toContain('add_short_answer_question');
  });

  it('resolves host key and caps question count to 10 for free users', async () => {
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email: `free-${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'Free User',
      freeGenerationsUsed: 0
    });

    const result = await resolveApiKeyAndEnforceQuota(userId, 25);
    expect(result.apiKey).toBe('test-default-host-gemini-key');
    expect(result.isCustomKey).toBe(false);
    expect(result.allowedCount).toBe(10);
  });

  it('blocks quiz generation when free quota is exhausted', async () => {
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email: `exhausted-${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'Exhausted User',
      freeGenerationsUsed: 2
    });

    await expect(resolveApiKeyAndEnforceQuota(userId, 5))
      .rejects.toThrow('QUOTA_EXHAUSTED');
  });

  it('uses decrypted custom key and allows up to 50 questions', async () => {
    const userId = crypto.randomUUID();
    const rawCustomKey = 'AIzaSyCustomKeyFromUser123456';
    const encryptedKey = encryptApiKey(rawCustomKey);

    await db.insert(users).values({
      id: userId,
      email: `custom-${Date.now()}@example.com`,
      passwordHash: 'hash',
      name: 'BYO User',
      customGeminiApiKey: encryptedKey,
      freeGenerationsUsed: 2
    });

    const result = await resolveApiKeyAndEnforceQuota(userId, 40);
    expect(result.apiKey).toBe(rawCustomKey);
    expect(result.isCustomKey).toBe(true);
    expect(result.allowedCount).toBe(40);
  });
});
