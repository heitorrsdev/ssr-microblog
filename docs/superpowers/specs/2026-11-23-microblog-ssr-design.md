# Microblog SSR: Design

Date: 2026-11-23 · Status: awaiting review

## 1. Goal

A study project on **server-side rendering (SSR)** with a meta-framework, built with good engineering practices: tests, CI, Docker, ADRs and small PRs. The product is a **microblog** (mini social network) delivered in phases. The product matters less than learning SSR.

### SSR concepts to exercise

| Concept | Where it shows up |
|---|---|
| SSG (prerendering) | Landing and "about" |
| Per-request SSR | Feed, profile and post |
| Server-side data fetching + `TransferState` | All dynamic pages |
| SEO | Title, meta, canonical, Open Graph, `sitemap.xml`, `robots.txt` |
| Incremental hydration (`@defer`) | Likes and comments |
| HTTP cache | `Cache-Control` per route |
| Errors with the correct status | Real 404 and 500 |
| SSR with user state (phase 2) | Cookie session, `Vary`, `no-store` |

## 2. Decisions

- **Framework:** Angular 22 (CLI latest on 2026-11-23: 22.3.0) with `@angular/ssr`, strict TypeScript, standalone components and signals.
- **Runtime:** Node 24 LTS (the CLI requires `^22.22.3 || ^24.15.0 || >=26`), managed with `fnm` (`.node-version`).
- **Package manager:** pnpm, pinned in `packageManager` and enabled via `corepack`. Dependencies with a native build (`better-sqlite3`) go in `allowBuilds` (`pnpm-workspace.yaml`) and are marked as `externalDependencies` in the Angular build.
- **Server:** Express, the official `@angular/ssr` path. API and SSR in the same process (monolith).
- **Database:** SQLite with `better-sqlite3` and Drizzle ORM (versioned migrations).
- **Validation:** Zod (API input and environment variables). **Logging:** `pino`.
- **Tests:** Vitest (unit and integration) and Playwright (E2E). Vitest being the default runner in Angular 22 must be **confirmed during setup**.
- **Quality:** ESLint (`angular-eslint`), Prettier, Conventional Commits.
- **Delivery:** multi-stage Dockerfile and GitHub Actions.
- **Language:** code, identifiers, tests, docs and commits are in English. User-facing UI copy is in pt-BR.
- **Out of scope (YAGNI):** real time, image upload, notifications, i18n, cloud deploy.

## 3. Structure and boundaries

```
ssr/
├─ src/
│  ├─ app/               # Angular (UI)
│  │  ├─ core/           # session, interceptors, SeoService
│  │  ├─ features/       # feed, post, profile (each with its routes)
│  │  └─ app.routes.ts, app.routes.server.ts
│  ├─ server/            # runs only on Node
│  │  ├─ api/            # HTTP routes + validation (Zod)
│  │  ├─ services/       # business rules
│  │  ├─ db/             # Drizzle schema, migrations, repositories
│  │  └─ app.ts          # builds Express (no listen, for testing)
│  ├─ shared/            # DTOs/types used by both sides
│  └─ server.ts          # entrypoint: Express + Angular SSR
├─ e2e/                  # Playwright
├─ docs/adr, docs/superpowers
├─ Dockerfile, .github/workflows/ci.yml
```

Rules:

- `app/` never imports from `server/`, and `server/` never imports from `app/`. Anything shared lives in `shared/`.
- Inside `server/`, each layer only knows the one below it: `api` → `services` → `db`.
- `app.ts` exports Express without calling `listen`, so the API is testable without Angular.

## 4. Request flow

1. Static files from the build.
2. `/api/*`, `/sitemap.xml` and `/robots.txt` are handled by Express.
3. Any other URL goes to Angular SSR, which returns HTML.
4. In the browser, Angular hydrates the HTML and reuses the data through `TransferState`, without repeating the calls.

Components fetch data with `HttpClient` against `/api`, using the same code on the server and in the browser. On the server the call goes through loopback to Express itself. Injecting the services directly in-process is a possible optimization, to be recorded in an ADR if adopted. In phase 2, the server must forward the session cookie in those calls.

## 5. Rendering per route (phase 1)

| Route | Mode | Cache-Control | Notes |
|---|---|---|---|
| `/`, `/sobre` | Prerender | `public`, long | Generated at build time |
| `/feed` | SSR | `public, max-age=30, stale-while-revalidate` | Pagination via `?page=` |
| `/u/:handle` | SSR | `public, max-age=60` | Profile meta tags |
| `/p/:id` | SSR | `public, max-age=60` | Open Graph with the post text; real 404 if it does not exist |
| `**` | SSR | `no-store` | 404 page with status 404 |

In phase 2, session-dependent routes use `private, no-store` with `Vary: Cookie`.

- **SEO:** a `SeoService` sets title, description, canonical and Open Graph per route. `sitemap.xml` and `robots.txt` are generated on the server from the database.
- **Incremental hydration:** likes and comments in `@defer` blocks with `hydrate on viewport`.
- **Errors:** 404 and 500 with the correct HTTP status. The server logs the error and does not expose details to the client.
- **Browser-only code:** `window`/`localStorage` guarded by `afterNextRender` or `isPlatformBrowser`.

## 6. Data and API (phase 1)

Phase 1 is **read-only** and uses a seed script.

- `users`: `id`, `handle` (unique), `display_name`, `bio`, `created_at`.
- `posts`: `id`, `user_id`, `body` (up to 280 characters), `created_at`, with an index on `created_at`.

Endpoints:

- `GET /api/posts?page=&limit=`
- `GET /api/posts/:id`
- `GET /api/users/:handle`
- `GET /api/users/:handle/posts`
- `GET /api/health`

Errors follow a single format `{ "error": { "code", "message" } }`. Configuration comes from environment variables validated at startup.

## 7. Tests

- **Vitest, unit:** services, `SeoService` and components.
- **Vitest, integration:** API with in-memory SQLite (via `supertest`), covering repositories and routes.
- **Playwright, E2E:**
  - the raw response HTML already contains the post text, without running JS;
  - hydration works;
  - a nonexistent post returns status 404;
  - meta tags and `sitemap.xml` are correct.
- TDD in the service and API layers. No numeric coverage target.

## 8. Quality and delivery

- Strict TypeScript, ESLint, Prettier, Conventional Commits.
- Protected `main`, work in small PRs per slice, even as a solo project.
- Short ADRs in `docs/adr` for relevant decisions: Express, SQLite, pnpm, loopback vs. direct injection.
- Multi-stage Dockerfile, non-root user and `HEALTHCHECK` on `/api/health`. The database lives in a volume.
- GitHub Actions: lint, typecheck, tests, build, E2E and Docker image build.

## 9. Phases

1. **Phase 1 (public, read-only):** feed, profile, post, SEO, cache, incremental hydration, tests, Docker and CI.
2. **Phase 2:** login with an `httpOnly` cookie session, create post and like. SSR with user state and safe caching.
3. **Phase 3 (optional):** follow and personalized feed.

Each phase is independently deliverable and has its own implementation plan.

## 10. Verified during setup (2026-11-23)

- Vitest 5 is Angular 22's default runner (`@angular/build:unit-test`). Server tests run in a separate Vitest on plain Node.
- `better-sqlite3` does not work bundled into the server bundle; it needs `externalDependencies` and must exist in `node_modules` in the Docker image.
- Angular 22 validates the `Host` header (SSRF). At runtime, `NG_ALLOWED_HOSTS` lists the accepted hosts.
- `ServerRoute` accepts `headers` and `status`; `RESPONSE_INIT` lets you set status and headers from a resolver.
- Incremental hydration is enabled by default.
- Prerendered pages do not emit `canonical`/`og:url`, because the public URL is only known at runtime.

## 11. Open risks

- Prevent the cache from serving one user's content to another (phase 2).
- 404 responses from `/p/:id` must not be cached like successful ones (covered by an E2E test).
