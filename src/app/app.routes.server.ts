import { RenderMode, ServerRoute } from '@angular/ssr';

const STATIC_CACHE = { 'Cache-Control': 'public, max-age=3600' };

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender, headers: STATIC_CACHE },
  { path: 'sobre', renderMode: RenderMode.Prerender, headers: STATIC_CACHE },
  {
    path: 'feed',
    renderMode: RenderMode.Server,
    headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' },
  },
  {
    path: 'u/:handle',
    renderMode: RenderMode.Server,
    headers: { 'Cache-Control': 'public, max-age=60' },
  },
  {
    path: 'p/:id',
    renderMode: RenderMode.Server,
    headers: { 'Cache-Control': 'public, max-age=60' },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  },
];
