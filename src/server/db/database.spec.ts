import { afterEach, describe, expect, it } from 'vitest';
import { createDb, type DbHandle } from './database';
import { posts, users } from './schema';

describe('createDb', () => {
  let handle: DbHandle | undefined;

  afterEach(() => handle?.close());

  it('applies migrations and allows inserting and reading', () => {
    handle = createDb(':memory:', 'drizzle');
    const user = handle.db
      .insert(users)
      .values({ handle: 'maria', displayName: 'Maria' })
      .returning()
      .get();
    handle.db.insert(posts).values({ userId: user.id, body: 'hello' }).run();

    expect(handle.db.select().from(posts).all()).toHaveLength(1);
  });

  it('rejects a post from a nonexistent user (foreign keys enabled)', () => {
    handle = createDb(':memory:', 'drizzle');
    const { db } = handle;

    expect(() => db.insert(posts).values({ userId: 999, body: 'x' }).run()).toThrow();
  });

  it('rejects a duplicate handle', () => {
    handle = createDb(':memory:', 'drizzle');
    const { db } = handle;
    db.insert(users).values({ handle: 'ana', displayName: 'Ana' }).run();

    expect(() => db.insert(users).values({ handle: 'ana', displayName: 'Outra' }).run()).toThrow();
  });
});
