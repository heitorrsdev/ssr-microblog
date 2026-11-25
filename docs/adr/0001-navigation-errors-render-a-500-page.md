# 0001. Navigation errors render a 500 page

## Context

When a route resolver fails with anything other than a 404 (API down, 5xx, network), the initial navigation fails. `@angular/ssr` then reports a navigation error and `server.ts` falls through to Express, which answers a generic 404 "Cannot GET". In the browser the failed navigation is cancelled silently.

## Decision

`provideRouter` uses `withNavigationErrorHandler(handleNavigationError)`. The handler logs the error through Angular's `ErrorHandler`, sets `RESPONSE_INIT` to status 500 with `Cache-Control: no-store` (keeping the headers `@angular/ssr` pre-fills), and returns a `RedirectCommand` to `/erro` with `skipLocationChange`. Because the address does not change, the SSR engine does not issue an HTTP redirect and renders the error page with the 500 status. The `/erro` server route also sets 500 and `no-store` for direct access.

## Consequences

- Real 500 with HTML, no cache, and a pt-BR error page, on the server and in the browser.
- The error is logged on the server by Angular's `ErrorHandler` (console), separate from the pino logger used by the API.
- The 404 case is unchanged: resolvers still convert it to `null` with `orNotFound`.
