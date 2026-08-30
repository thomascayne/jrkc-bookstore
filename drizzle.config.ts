import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './db/schema.ts',
  strict: true,
  verbose: true,
});
