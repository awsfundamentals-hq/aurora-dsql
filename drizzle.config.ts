import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: `./lambda/db/schema.ts`,
  extensionsFilters: ['postgis'],
  schemaFilter: 'public',
  tablesFilter: '*',
});
