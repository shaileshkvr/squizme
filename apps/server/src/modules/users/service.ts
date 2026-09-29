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
