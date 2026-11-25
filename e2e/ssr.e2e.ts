import { expect, test } from '@playwright/test';

// The seed creates 48 posts; the newest is #48 (id 48) and its author is "caio".

test.describe('server-rendered HTML (without running JavaScript)', () => {
  test('feed has posts, SEO and cache in the raw HTML', async ({ request }) => {
    const res = await request.get('/feed');
    const html = await res.text();

    expect(res.status()).toBe(200);
    expect(res.headers()['cache-control']).toBe('public, max-age=30, stale-while-revalidate=60');
    expect(html).toContain('(#48)');
    expect(html).toContain('<title>Feed · Microblog</title>');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('rel="canonical" href="http://localhost:4300/feed"');
  });

  test('post has article Open Graph, canonical and the deferred block already rendered', async ({
    request,
  }) => {
    const html = await (await request.get('/p/48')).text();

    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('rel="canonical" href="http://localhost:4300/p/48"');
    expect(html).toContain('Mais posts de @caio');
  });

  test('an existing profile renders and a nonexistent one returns 404', async ({ request }) => {
    const ok = await request.get('/u/caio');
    expect(ok.status()).toBe(200);
    expect(await ok.text()).toContain('Caio Mendes');

    expect((await request.get('/u/nobody')).status()).toBe(404);
  });

  test('a nonexistent post returns a real 404, uncached and not indexable', async ({ request }) => {
    const res = await request.get('/p/99999');
    const html = await res.text();

    expect(res.status()).toBe(404);
    expect(res.headers()['cache-control']).toBe('no-store');
    expect(html).toContain('Post não encontrado');
    expect(html).toContain('content="noindex"');
  });

  test('an unknown route returns 404', async ({ request }) => {
    const res = await request.get('/does-not-exist');

    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('Página não encontrada');
  });

  test('prerendered pages respond with a long cache', async ({ request }) => {
    for (const path of ['/', '/sobre']) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['cache-control']).toBe('public, max-age=3600');
    }
  });

  test('sitemap lists posts and robots points to the sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const robots = await (await request.get('/robots.txt')).text();

    expect(sitemap).toContain('<loc>http://localhost:4300/p/48</loc>');
    expect(sitemap).toContain('<loc>http://localhost:4300/u/caio</loc>');
    expect(robots).toContain('Sitemap: http://localhost:4300/sitemap.xml');
  });

  test('API responds with JSON in the standard error format', async ({ request }) => {
    const res = await request.get('/api/posts/99999');

    expect(res.status()).toBe(404);
    expect((await res.json()).error.code).toBe('post_not_found');
  });
});

test.describe('browser', () => {
  test('hydrates without errors and reuses the server data (without calling the API)', async ({
    page,
  }) => {
    const errors: string[] = [];
    const apiCalls: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.url().includes('/api/')) apiCalls.push(request.url());
    });

    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
    expect(apiCalls).toEqual([]);
  });

  test('pagination navigates through the query string', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('link', { name: 'Próxima' }).click();

    await expect(page).toHaveURL(/\/feed\?page=2$/);
    await expect(page.getByText('(#38)')).toBeVisible();
    await expect(page.getByText('(#48)')).toHaveCount(0);
  });

  test('clicking the author opens the profile', async ({ page }) => {
    await page.goto('/p/48');
    await page.getByRole('link', { name: 'Caio Mendes' }).first().click();

    await expect(page).toHaveURL(/\/u\/caio$/);
    await expect(page.getByRole('heading', { name: 'Caio Mendes' })).toBeVisible();
  });
});
