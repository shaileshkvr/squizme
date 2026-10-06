import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, client } from './index.js';
import { users } from './schema.js';

export async function seedTestUser() {
  const email = 'testacc404@gmail.com';
  const password = '#test-user-404';
  const firstName = 'Test';
  const lastName = 'User';

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    await db.update(users).set({
      passwordHash,
      firstName,
      lastName,
      freeGenerationsUsed: 0
    }).where(eq(users.email, email));
    console.log(`Updated existing test user: ${email}`);
  } else {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'user',
      freeGenerationsUsed: 0
    });
    console.log(`Created new test user: ${email}`);
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedTestUser()
    .then(async () => {
      console.log('Seed completed successfully.');
      await client.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed error:', err);
      await client.end();
      process.exit(1);
    });
}
