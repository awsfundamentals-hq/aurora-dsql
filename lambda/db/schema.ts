import { integer, char, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: integer().primaryKey(),
  title: char(),
  content: char(),
  created_at: timestamp(),
});
