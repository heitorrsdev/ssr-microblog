import { count, desc, eq } from 'drizzle-orm';
import type { Db } from './database';
import { posts, users } from './schema';

export interface PostRow {
  id: number;
  body: string;
  createdAt: string;
  authorHandle: string;
  authorDisplayName: string;
}

export interface PostsFilter {
  userId?: number;
}

export function createPostsRepository(db: Db) {
  const columns = {
    id: posts.id,
    body: posts.body,
    createdAt: posts.createdAt,
    authorHandle: users.handle,
    authorDisplayName: users.displayName,
  };
  const byUser = (userId?: number) => (userId === undefined ? undefined : eq(posts.userId, userId));

  return {
    findPage(options: PostsFilter & { limit: number; offset: number }): PostRow[] {
      return db
        .select(columns)
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(byUser(options.userId))
        .orderBy(desc(posts.createdAt), desc(posts.id))
        .limit(options.limit)
        .offset(options.offset)
        .all();
    },

    count(filter: PostsFilter = {}): number {
      return (
        db.select({ total: count() }).from(posts).where(byUser(filter.userId)).get()?.total ?? 0
      );
    },

    findById(id: number): PostRow | undefined {
      return db
        .select(columns)
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.id, id))
        .get();
    },

    listIds(): number[] {
      return db
        .select({ id: posts.id })
        .from(posts)
        .orderBy(desc(posts.id))
        .all()
        .map((row) => row.id);
    },
  };
}

export type PostsRepository = ReturnType<typeof createPostsRepository>;
