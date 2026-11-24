import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createLogger } from './logger';
import { createRenderErrorHandler } from './render-error-handler';

describe('createRenderErrorHandler', () => {
  it('responds 500 without leaking error details', async () => {
    const app = express();
    app.get('/breaks', () => {
      throw new Error('internal secret');
    });
    app.use(createRenderErrorHandler(createLogger('silent')));

    const res = await request(app).get('/breaks');

    expect(res.status).toBe(500);
    expect(res.text).toBe('Erro interno do servidor');
    expect(res.text).not.toContain('secret');
  });
});
