import { defineConfig } from 'drizzle-kit';

const dbHost = process.env.CLUSTER_HOST!;

if (!dbHost) {
  throw new Error('CLUSTER_HOST is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lambda/db/schema.ts',
  dbCredentials: {
    host: dbHost,
    port: 5432,
    user: 'admin',
    database: 'postgres',
    password: process.env.DB_TOKEN,
  },
});
