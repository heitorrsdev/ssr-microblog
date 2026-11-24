import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { loadConfig } from './config';
import type { DbHandle } from './db/database';
import { createLogger } from './logger';
import { createTestDb } from './testing/test-db';

describe('createApp', () => {
  let handle: DbHandle;

  beforeEach(() => {
    handle = createTestDb();
  });

  afterEach(() => handle.close());

  const build = () =>
    createApp({ config: loadConfig({}), db: handle.db, logger: createLogger('silent') });

  it('exposes the API under /api', async () => {
    const res = await request(build()).get('/api/health');

    expect(res.status).toBe(200);
  });

  it('exposes robots.txt and does not reveal the framework', async () => {
    const res = await request(build()).get('/robots.txt');

    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
