import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('usa valores padrão quando o ambiente está vazio', () => {
    expect(loadConfig({})).toEqual({
      PORT: 4000,
      DATABASE_PATH: 'data/microblog.db',
      MIGRATIONS_DIR: 'drizzle',
      SITE_URL: 'http://localhost:4000',
      LOG_LEVEL: 'info',
    });
  });

  it('converte PORT para número', () => {
    expect(loadConfig({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('remove a barra final de SITE_URL', () => {
    expect(loadConfig({ SITE_URL: 'https://exemplo.test/' }).SITE_URL).toBe('https://exemplo.test');
  });

  it('rejeita PORT inválida', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow();
  });

  it('rejeita LOG_LEVEL desconhecido', () => {
    expect(() => loadConfig({ LOG_LEVEL: 'barulhento' })).toThrow();
  });
});
