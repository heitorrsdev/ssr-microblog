import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio').notNull().default(''),
  createdAt: text('created_at').notNull().default(now),
});

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    createdAt: text('created_at').notNull().default(now),
  },
  (table) => [index('posts_created_at_idx').on(table.createdAt)],
);
