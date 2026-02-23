// @ts-expect-error pg has no type declarations in this context
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

export type DatabaseConnection = Awaited<ReturnType<typeof createDatabaseConnection>>;
