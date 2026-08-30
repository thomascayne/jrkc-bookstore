import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

function positiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function poolConfiguration() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    return {
      connectionString,
      connectionTimeoutMillis: 5_000,
      max: 1,
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
    max: 1,
    password,
    port: positiveInteger(process.env.POSTGRES_PORT, 5432),
    user: process.env.POSTGRES_USER?.trim() || 'jrkc_app',
  };
}

const pool = new Pool(poolConfiguration());

try {
  const database = drizzle({ client: pool });
  await migrate(database, { migrationsFolder: './drizzle' });
  console.log('Database migrations are current.');
} finally {
  await pool.end();
}
