import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';

import * as schema from '@/db/schema';

const globalDatabase = globalThis as typeof globalThis & {
  bookstorePool?: Pool;
};

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    return {
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      max: getPositiveInteger(process.env.DATABASE_POOL_MAX, 10),
      ssl:
        process.env.DATABASE_SSL === 'require'
          ? { rejectUnauthorized: true }
          : undefined,
    };
  }

  const password = process.env.POSTGRES_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      'Database configuration is missing. Set DATABASE_URL or POSTGRES_PASSWORD.',
    );
  }

  return {
    connectionTimeoutMillis: 5_000,
    database: process.env.POSTGRES_DB?.trim() || 'jrkc_bookstore',
    host: process.env.POSTGRES_HOST?.trim() || 'database',
    idleTimeoutMillis: 30_000,
    max: getPositiveInteger(process.env.DATABASE_POOL_MAX, 10),
    password,
    port: getPositiveInteger(process.env.POSTGRES_PORT, 5432),
    user: process.env.POSTGRES_USER?.trim() || 'jrkc_app',
  };
}

function getPool() {
  if (!globalDatabase.bookstorePool) {
    globalDatabase.bookstorePool = new Pool(getPoolConfig());
  }

  return globalDatabase.bookstorePool;
}

export async function checkDatabaseConnection(): Promise<void> {
  await getPool().query('select 1');
}

export function getDatabase() {
  return drizzle({ client: getPool(), schema });
}
