import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export async function createDatabaseConnection(hyperdrive: Hyperdrive) {
  const client = new Client({
    connectionString: hyperdrive.connectionString,
  });
  await client.connect();
  return drizzle(client, { schema });
}

export type DatabaseConnection = ReturnType<typeof createDatabaseConnection>;
