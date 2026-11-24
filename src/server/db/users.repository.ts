import { asc, eq } from 'drizzle-orm';
import type { Db } from './database';
import { users } from './schema';

export type UserRow = typeof users.$inferSelect;

export function createUsersRepository(db: Db) {
  return {
    findByHandle(handle: string): UserRow | undefined {
      return db.select().from(users).where(eq(users.handle, handle)).get();
    },

    listHandles(): string[] {
      return db
        .select({ handle: users.handle })
        .from(users)
        .orderBy(asc(users.handle))
        .all()
        .map((row) => row.handle);
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
