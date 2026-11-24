import type { Db } from '../db/database';
import { posts, users } from '../db/schema';

export function insertUser(db: Db, handle: string, displayName = handle) {
  return db
    .insert(users)
    .values({ handle, displayName, bio: `Bio of ${handle}` })
    .returning()
    .get();
}

export function insertPost(db: Db, userId: number, body: string, createdAt: string) {
  return db.insert(posts).values({ userId, body, createdAt }).returning().get();
}
