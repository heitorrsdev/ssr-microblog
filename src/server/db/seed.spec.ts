import { count } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb } from '../testing/test-db';
import type { DbHandle } from './database';
import { posts, users } from './schema';
import { SEED_POST_COUNT, seed } from './seed';

describe('seed', () => {
  let handle: DbHandle;

  beforeEach(() => {
    handle = createTestDb();
  });

  afterEach(() => handle.close());

  const total = (table: typeof users | typeof posts) =>
    handle.db.select({ total: count() }).from(table).get()?.total;

  it('populates users and posts in an empty database', () => {
    expect(seed(handle.db)).toBe(true);
    expect(total(users)).toBe(6);
    expect(total(posts)).toBe(SEED_POST_COUNT);
  });

  it('is idempotent: does not duplicate data on the second run', () => {
    seed(handle.db);

    expect(seed(handle.db)).toBe(false);
    expect(total(posts)).toBe(SEED_POST_COUNT);
  });

  it('generates posts of up to 280 characters with distinct texts', () => {
    seed(handle.db);
    const bodies = handle.db
      .select({ body: posts.body })
      .from(posts)
      .all()
      .map((r) => r.body);

    expect(bodies.every((body) => body.length <= 280)).toBe(true);
    expect(new Set(bodies).size).toBe(SEED_POST_COUNT);
  });
});
