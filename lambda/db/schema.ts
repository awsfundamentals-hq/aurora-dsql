import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: varchar().primaryKey(),
  title: varchar(),
  content: varchar(),
  created_at: timestamp(),
});
