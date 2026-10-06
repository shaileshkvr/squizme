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
    firstName: input.firstName,
    lastName: input.lastName || '',
    role: 'user',
    freeGenerationsUsed: 0
  });

  const fullName = `${input.firstName} ${input.lastName || ''}`.trim();
  return { id, email: input.email, firstName: input.firstName, lastName: input.lastName || '', name: fullName, role: 'user' };
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

  const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, name: fullName, role: user.role };
}
