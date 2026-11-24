import { Router } from 'express';
import type { PostsRepository } from '../db/posts.repository';
import type { UsersRepository } from '../db/users.repository';

export interface SeoDeps {
  siteUrl: string;
  posts: PostsRepository;
  users: UsersRepository;
}

const STATIC_PATHS = ['/', '/sobre', '/feed'];

// Interpolated values are safe in the XML: handles match /^[a-z0-9_]+$/ and ids are integers.
export function createSeoRouter({ siteUrl, posts, users }: SeoDeps): Router {
  const router = Router();

  router.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  });

  router.get('/sitemap.xml', (_req, res) => {
    const paths = [
      ...STATIC_PATHS,
      ...users.listHandles().map((handle) => `/u/${handle}`),
      ...posts.listIds().map((id) => `/p/${id}`),
    ];
    const entries = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n');
    res
      .set('Cache-Control', 'public, max-age=3600')
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
      );
  });

  return router;
}
