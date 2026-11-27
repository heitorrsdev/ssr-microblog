# ADR 0002: SQLite with Drizzle and a native module external to the bundle

Date: 2026-11-23 · Status: accepted

## Context

We need simple relational persistence with no extra infrastructure. The Angular build packs the server into a single ESM file.

## Decision

SQLite via `better-sqlite3` with Drizzle ORM and versioned migrations in `drizzle/`. `better-sqlite3` is a native module and breaks if bundled (`__dirname is not defined`); that is why it is in `externalDependencies` in `angular.json` and in `allowBuilds` in `pnpm-workspace.yaml`. Migrations are read at runtime from `MIGRATIONS_DIR` (default `drizzle`).

## Consequences

- The Docker image needs production `node_modules` and the `drizzle/` folder.
- The database lives in a file; in a container, in a volume (`/data`).
- Switching to Postgres only touches `src/server/db`.
