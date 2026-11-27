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

Enable automatic Node version switching once (in `~/.zshrc` or `~/.bashrc`), so entering the folder activates Node 24 from `.node-version`:

```bash
eval "$(fnm env --use-on-cd)"
```

Then:

```bash
corepack enable pnpm    # first time only
pnpm bootstrap          # install, create .env from .env.example, seed data/microblog.db
pnpm start              # dev server at http://localhost:4200
pnpm start:prod         # production build at http://localhost:4000, reads .env
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
