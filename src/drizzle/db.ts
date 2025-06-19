import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import { env } from '@/data/env/server';
import * as schema from '@/drizzle/schema';

export const db = drizzle(env.DATABASE_URL, {
  schema
});
