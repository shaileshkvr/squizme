import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionUri = process.env.DATABASE_URL || 'postgresql://postgres:rootpassword@localhost:5432/squizme';

export const client = postgres(connectionUri);
export const db = drizzle(client, { schema });
