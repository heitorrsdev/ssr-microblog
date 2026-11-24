import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DbHandle } from '../db/database';
import { createPostsRepository } from '../db/posts.repository';
import { NotFoundError } from '../errors';
import { insertPost, insertUser } from '../testing/fixtures';
import { createTestDb } from '../testing/test-db';
import { createPostsService } from './posts.service';

describe('PostsService', () => {
  let handle: DbHandle;
  let service: ReturnType<typeof createPostsService>;

  beforeEach(() => {
    handle = createTestDb();
    service = createPostsService({ posts: createPostsRepository(handle.db) });
    const maria = insertUser(handle.db, 'maria', 'Maria Souza');
    insertPost(handle.db, maria.id, 'first', '2026-11-01T10:00:00.000Z');
    insertPost(handle.db, maria.id, 'second', '2026-11-02T10:00:00.000Z');
    insertPost(handle.db, maria.id, 'third', '2026-11-03T10:00:00.000Z');
  });

  afterEach(() => handle.close());

  describe('list', () => {
    it('returns the newest posts first and reports the total page count', () => {
      const page = service.list({ page: 1, limit: 2 });

      expect(page.items.map((post) => post.body)).toEqual(['third', 'second']);
      expect(page).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it('returns the second page with the remainder', () => {
      const page = service.list({ page: 2, limit: 2 });

      expect(page.items.map((post) => post.body)).toEqual(['first']);
    });

    it('returns an empty page past the end, without error', () => {
      expect(service.list({ page: 9, limit: 2 }).items).toEqual([]);
    });
  });

  describe('get', () => {
    it('returns the post with its author', () => {
      const [newest] = service.list({ page: 1, limit: 1 }).items;

      expect(service.get(newest.id)).toEqual({
        id: newest.id,
        body: 'third',
        createdAt: '2026-11-03T10:00:00.000Z',
        author: { handle: 'maria', displayName: 'Maria Souza' },
      });
    });

    it('throws NotFoundError when the post does not exist', () => {
      expect(() => service.get(999)).toThrow(NotFoundError);
    });
  });
});
