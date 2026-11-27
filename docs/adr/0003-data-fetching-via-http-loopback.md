# ADR 0003: Page data via HTTP (loopback on the server)

Date: 2026-11-23 · Status: accepted

## Context

Components need the same data on the server (SSR) and in the browser.

## Decision

Resolvers use `HttpClient` against `/api` in both environments. On the server, the call loops back to Express itself and the result is transferred to the browser through Angular's HTTP transfer cache, which avoids repeating the call during hydration (verified in E2E). The accepted host is controlled by `allowedHosts`/`NG_ALLOWED_HOSTS`.

Angular resolves relative URLs on the server against the request's `Host` header. That origin is not always reachable from inside the server (a remapped container port, a reverse proxy), so a server-only `LoopbackBackend` (`src/app/core/loopback-backend.ts`) rewrites same-origin requests to `http://127.0.0.1:PORT`. It runs after the interceptors, so transfer cache keys stay the same as in the browser. `src/server.ts` passes `loopbackOrigin` in the request context only when it calls `listen` itself; under `ng serve` requests keep their original URL.

## Consequences

- A single code path for server and browser.
- Extra cost of one local call per rendered request. Future alternative: inject the services directly on the server; only worth it if measurements show a need.
- In phase 2, the server will need to forward the session cookie in those calls.
- Prerendered pages do not emit `canonical`/`og:url`, because the public URL is only known at runtime.
