import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('uses defaults when the environment is empty', () => {
    expect(loadConfig({})).toEqual({
      PORT: 4000,
      DATABASE_PATH: 'data/microblog.db',
      MIGRATIONS_DIR: 'drizzle',
      SITE_URL: 'http://localhost:4000',
      LOG_LEVEL: 'info',
    });
  });

  it('converts PORT to a number', () => {
    expect(loadConfig({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('strips the trailing slash from SITE_URL', () => {
    expect(loadConfig({ SITE_URL: 'https://exemplo.test/' }).SITE_URL).toBe('https://exemplo.test');
  });

  it('rejects an invalid PORT', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow();
  });

  it('rejects an unknown LOG_LEVEL', () => {
    expect(() => loadConfig({ LOG_LEVEL: 'barulhento' })).toThrow();
  });
});
