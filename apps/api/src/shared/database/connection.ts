import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDatabaseConnection(hyperdrive: Hyperdrive) {
  const sql = neon(hyperdrive.connectionString);
  return drizzle(sql, { schema });
}

export type DatabaseConnection = ReturnType<typeof createDatabaseConnection>;
