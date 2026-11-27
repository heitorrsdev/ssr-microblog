# ADR 0001: SSR monolith with Express

Date: 2026-11-23 · Status: accepted

## Context

The project studies SSR with Angular. We had to decide where the API and the rendering server live.

## Decision

A single Node process with Express: it serves the API (`/api/*`), `sitemap.xml`, `robots.txt` and delegates the rest to Angular SSR. The server is split into layers (`api` → `services` → `db`) and `createApp()` neither knows Angular nor calls `listen`.

## Consequences

- Few moving parts and a simple deploy; the focus stays on SSR.
- The API is testable without starting Angular.
- Frontend and API share the deploy cycle. If that becomes a problem, the `src/server` layer can become its own service without changing the UI, since the UI only speaks HTTP.
- Express is the official `@angular/ssr` path, with more documentation available.
