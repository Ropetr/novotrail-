import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDatabaseConnection(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type DatabaseConnection = ReturnType<typeof createDatabaseConnection>;
