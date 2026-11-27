# Microblog SSR

Microblog built with **Angular 22 and server-side rendering (SSR)**, to study SSR with production-grade engineering practices. Full design in [`docs/superpowers/specs`](docs/superpowers/specs/2026-11-23-microblog-ssr-design.md).

## What it demonstrates

- Prerender (SSG) on `/` and `/sobre`; per-request SSR on `/feed`, `/u/:handle` and `/p/:id`.
- Server-side SEO: title, meta, Open Graph, canonical, `sitemap.xml` and `robots.txt`.
- HTTP cache per route, real 404s and incremental hydration (`@defer`).
- Express API with SQLite/Drizzle, unit, integration and E2E tests.

## Requirements

- [fnm](https://github.com/Schniz/fnm) (Node 24, defined in `.node-version`) and `corepack` (pnpm).

## How to run

```bash
fnm use                 # Node 24
corepack enable pnpm
pnpm install
pnpm db:seed            # creates data/microblog.db with sample data
pnpm start              # dev server at http://localhost:4200
```

Production build:

```bash
pnpm build
NG_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/ssr-microblog/server/server.mjs
```

Environment variables are in [`.env.example`](.env.example). In production, set `SITE_URL` and include the public domain in `NG_ALLOWED_HOSTS`.

## Docker

```bash
docker build -t ssr-microblog .
docker run -p 4000:4000 -v microblog-data:/data ssr-microblog
```

## Quality

| Command                           | What it does                      |
| --------------------------------- | --------------------------------- |
| `pnpm lint` / `pnpm format:check` | ESLint and Prettier               |
| `pnpm typecheck`                  | TypeScript without emitting       |
| `pnpm test --no-watch`            | UI tests (Vitest via Angular)     |
| `pnpm test:server`                | Server tests (Vitest on Node)     |
| `pnpm test:e2e`                   | Build + E2E tests with Playwright |

## Documentation

- Architecture decisions: [`docs/adr`](docs/adr)
- Implementation plans: [`docs/superpowers/plans`](docs/superpowers/plans)
- Rules for contributors (humans and agents): [`AGENTS.md`](AGENTS.md)
