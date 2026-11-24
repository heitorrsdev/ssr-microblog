import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DbHandle } from '../db/database';
import { createPostsRepository } from '../db/posts.repository';
import { createUsersRepository } from '../db/users.repository';
import { createLogger } from '../logger';
import { createPostsService } from '../services/posts.service';
import { createUsersService } from '../services/users.service';
import { insertPost, insertUser } from '../testing/fixtures';
import { createTestDb } from '../testing/test-db';
import { createApiRouter } from './router';

describe('API', () => {
  let handle: DbHandle;
  let app: express.Express;
  let firstPostId: number;

  beforeEach(() => {
    handle = createTestDb();
    const posts = createPostsRepository(handle.db);
    const users = createUsersRepository(handle.db);
    app = express();
    app.use(
      '/api',
      createApiRouter(
        { posts: createPostsService({ posts }), users: createUsersService({ users, posts }) },
        createLogger('silent'),
      ),
    );

    const maria = insertUser(handle.db, 'maria', 'Maria Souza');
    firstPostId = insertPost(handle.db, maria.id, 'one', '2026-11-01T10:00:00.000Z').id;
    insertPost(handle.db, maria.id, 'two', '2026-11-02T10:00:00.000Z');
    insertPost(handle.db, maria.id, 'three', '2026-11-03T10:00:00.000Z');
  });

  afterEach(() => handle.close());

  it('GET /api/health responds ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  describe('GET /api/posts', () => {
    it('lists with pagination', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.items.map((post: { body: string }) => post.body)).toEqual(['three', 'two']);
      expect(res.body).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it('defaults to page 1 and limit 10', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.body).toMatchObject({ page: 1, limit: 10 });
    });

    it.each(['page=0', 'page=abc', 'limit=0', 'limit=51'])(
      'rejects invalid parameters (%s) with 400',
      async (query) => {
        const res = await request(app).get(`/api/posts?${query}`);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('invalid_request');
      },
    );
  });

  describe('GET /api/posts/:id', () => {
    it('returns the post', async () => {
      const res = await request(app).get(`/api/posts/${firstPostId}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: firstPostId, body: 'one' });
    });

    it('returns 404 in the standard error format', async () => {
      const res = await request(app).get('/api/posts/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: { code: 'post_not_found', message: 'Post not found' } });
    });

    it('returns 400 for a non-numeric id', async () => {
      const res = await request(app).get('/api/posts/abc');

      expect(res.status).toBe(400);
    });
  });

  describe('users', () => {
    it('GET /api/users/:handle returns the profile', async () => {
      const res = await request(app).get('/api/users/maria');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ handle: 'maria', postCount: 3 });
    });

    it('GET /api/users/:handle returns 404 for a nonexistent user', async () => {
      const res = await request(app).get('/api/users/nobody');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('user_not_found');
    });

    it('GET /api/users/:handle rejects an invalid handle with 400', async () => {
      const res = await request(app).get('/api/users/Invalid%20Handle');

      expect(res.status).toBe(400);
    });

    it("GET /api/users/:handle/posts lists the user's posts", async () => {
      const res = await request(app).get('/api/users/maria/posts?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(3);
    });
  });

  it('an unknown route under /api returns 404 as JSON', async () => {
    const res = await request(app).get('/api/nothing');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('route_not_found');
  });
});
