import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DbHandle } from '../db/database';
import { createPostsRepository } from '../db/posts.repository';
import { createUsersRepository } from '../db/users.repository';
import { insertPost, insertUser } from '../testing/fixtures';
import { createTestDb } from '../testing/test-db';
import { createSeoRouter } from './seo.router';

describe('SEO router', () => {
  let handle: DbHandle;
  let app: express.Express;
  let postId: number;

  beforeEach(() => {
    handle = createTestDb();
    app = express();
    app.use(
      createSeoRouter({
        siteUrl: 'https://example.test',
        posts: createPostsRepository(handle.db),
        users: createUsersRepository(handle.db),
      }),
    );
    const maria = insertUser(handle.db, 'maria');
    postId = insertPost(handle.db, maria.id, 'hello', '2026-11-01T10:00:00.000Z').id;
  });

  afterEach(() => handle.close());

  it('robots.txt points to the sitemap', async () => {
    const res = await request(app).get('/robots.txt');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/plain');
    expect(res.text).toContain('Sitemap: https://example.test/sitemap.xml');
  });

  it('sitemap.xml lists static pages, profiles and posts', async () => {
    const res = await request(app).get('/sitemap.xml');

    expect(res.status).toBe(200);
    expect(res.type).toBe('application/xml');
    expect(res.headers['cache-control']).toBe('public, max-age=3600');
    expect(res.text).toContain('<loc>https://example.test/</loc>');
    expect(res.text).toContain('<loc>https://example.test/feed</loc>');
    expect(res.text).toContain('<loc>https://example.test/u/maria</loc>');
    expect(res.text).toContain(`<loc>https://example.test/p/${postId}</loc>`);
  });
});
