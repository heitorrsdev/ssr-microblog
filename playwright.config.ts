import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'rm -f data/e2e.db data/e2e.db-shm data/e2e.db-wal && pnpm db:seed && node dist/ssr-microblog/server/server.mjs',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      SITE_URL: `http://localhost:${PORT}`,
      DATABASE_PATH: 'data/e2e.db',
      LOG_LEVEL: 'silent',
      NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',
    },
  },
});
