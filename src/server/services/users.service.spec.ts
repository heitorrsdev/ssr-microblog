import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DbHandle } from '../db/database';
import { createPostsRepository } from '../db/posts.repository';
import { createUsersRepository } from '../db/users.repository';
import { NotFoundError } from '../errors';
import { insertPost, insertUser } from '../testing/fixtures';
import { createTestDb } from '../testing/test-db';
import { createUsersService } from './users.service';

describe('UsersService', () => {
  let handle: DbHandle;
  let service: ReturnType<typeof createUsersService>;

  beforeEach(() => {
    handle = createTestDb();
    service = createUsersService({
      users: createUsersRepository(handle.db),
      posts: createPostsRepository(handle.db),
    });
    const maria = insertUser(handle.db, 'maria', 'Maria Souza');
    const joao = insertUser(handle.db, 'joao', 'João Lima');
    insertPost(handle.db, maria.id, 'maria 1', '2026-11-01T10:00:00.000Z');
    insertPost(handle.db, maria.id, 'maria 2', '2026-11-02T10:00:00.000Z');
    insertPost(handle.db, joao.id, 'joao 1', '2026-11-03T10:00:00.000Z');
  });

  afterEach(() => handle.close());

  it("returns the profile with the user's own post count", () => {
    expect(service.getProfile('maria')).toMatchObject({
      handle: 'maria',
      displayName: 'Maria Souza',
      bio: 'Bio of maria',
      postCount: 2,
    });
  });

  it('throws NotFoundError for a nonexistent user', () => {
    expect(() => service.getProfile('nobody')).toThrow(NotFoundError);
    expect(() => service.listPosts('nobody', { page: 1, limit: 10 })).toThrow(NotFoundError);
  });

  it("lists only the user's posts, newest to oldest", () => {
    const page = service.listPosts('maria', { page: 1, limit: 10 });

    expect(page.items.map((post) => post.body)).toEqual(['maria 2', 'maria 1']);
    expect(page.total).toBe(2);
  });
});
