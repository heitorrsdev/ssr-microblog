# AGENTS.md

Instructions for coding agents (and people) working in this repository.

## Project

Microblog built with **Angular 22 and SSR**, made to study server-side rendering with production-grade engineering practices. The full design is in `docs/superpowers/specs/2026-11-23-microblog-ssr-design.md`. Read the spec before proposing architecture changes. Implementation plans live in `docs/superpowers/plans/`. To resume an interrupted execution, read `docs/superpowers/HANDOFF.md`.

Stack: Node 24 LTS (`fnm`), pnpm (via `corepack`), Angular 22 + `@angular/ssr`, Express, SQLite (`better-sqlite3`) + Drizzle, Zod, `pino`, Vitest, Playwright.

> Build, test and lint commands are added here when the project is set up. Do not invent commands: check `package.json`.

## Language

- **Everything is written in English:** code, identifiers, test names, error messages, documentation, ADRs, PR titles and descriptions, and commit messages.
- The only exception is user-facing UI copy, which stays in pt-BR because the product targets Portuguese speakers.

## Comments

- **Avoid comments.** Write clear names and small functions instead.
- Add a comment only when it is truly necessary: a non-obvious _why_ (a workaround, a hidden constraint, a surprising behavior). Never describe _what_ the code does.
- No commented-out code, no TODOs without an issue.

## Code principles

- **SRP (single responsibility):** every module, class, function and component has exactly one reason to change. If you need "and" to describe what something does, split it.
- **KISS:** pick the simplest solution that solves the current problem. No abstraction, configuration or layer "for the future" (YAGNI). Three similar lines beat a premature abstraction.
- Small, focused files. A file that grows too large signals mixed responsibilities.
- Strict TypeScript: no implicit `any` and no `// @ts-ignore` without justification.

## Architecture (boundaries)

- `src/app/` (Angular UI) never imports from `src/server/`, and `src/server/` never imports from `src/app/`. Anything shared lives in `src/shared/`.
- On the server, each layer only knows the one below it: `api` → `services` → `db`. Business rules live in `services`, not in routes or components.
- `src/server/app.ts` exports Express without calling `listen`, so the API can be tested without Angular.
- External input (HTTP, env) is validated with Zod at the boundary.

## SSR rules

- Never use `window`, `document` or `localStorage` directly. Guard with `afterNextRender` or `isPlatformBrowser`.
- Errors return the correct HTTP status (a real 404, not an error page with 200).
- Set each route's `Cache-Control` deliberately. Session-dependent content uses `private, no-store` and `Vary: Cookie`.
- Every public page sets title, description, canonical and Open Graph through `SeoService`.

## Tests

- TDD in the service and API layers: failing test first, then the implementation.
- Vitest for unit and integration tests. Playwright for E2E, including a check that the raw HTML contains the content without running JS.
- Nothing is done until lint, typecheck, tests and build have run and you have seen the output.

## Git and commits

- **Never add co-authorship to commits.** No `Co-Authored-By`, no mention of AI or tooling in the message, and the same goes for PR descriptions. The author is only the person configured in git.
- Commit messages in **English**, following **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`), with an imperative subject of up to ~72 characters.
- Atomic commits: one logical change per commit, with its tests.
- Do not `push`, `amend`, `rebase` or `force-push` without an explicit request, and never write directly to `main`. Work in branches and open small PRs.
- Do not commit secrets, `.env` or the local SQLite database.

## Migrations

- Generate migrations with a descriptive snake_case name: `pnpm db:generate --name=<what_changes>` (for example `add_post_likes`). Never keep the random name drizzle-kit suggests.
- Never edit or rename a migration that has already been merged to `main`.

## Decisions and documentation

- Relevant architecture decisions go in a short ADR in `docs/adr/` (context, decision, consequences).
- Changes that alter the spec update the spec in the same PR.
