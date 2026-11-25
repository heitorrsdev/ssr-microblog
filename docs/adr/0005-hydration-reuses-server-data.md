# 0005. Hydration reuses server data and the deferred block does not flicker

## Context

The point of SSR here is that the browser does not repeat the API calls the server already made, and that incremental hydration (`@defer (on viewport; hydrate on viewport)` for "Mais posts de @x" on `/p/:id`) keeps the server-rendered DOM. Slice F left two open questions: does the transfer cache cover the initial load, and does the deferred block refetch and flicker once hydrated (the HTTP and resource transfer caches turn off when the app becomes stable)?

## Decision

No code change. Both behaviors were checked in a real Chromium against the production build with throwaway Playwright probes, and the first one is now covered by an E2E test.

- `/feed`: after hydration there are zero `/api/` requests and no console errors, so `HttpTransferCache` serves the resolver data.
- `/p/48`: the post itself comes from the transfer cache (no request). The deferred block hydrates only when it enters the viewport. With a 150px viewport (block 305px below the top) there were no requests before scrolling and exactly one `GET /api/users/caio/posts?page=1` after scrolling. With a viewport that already shows the block, that request happens right after load.
- That request is a real refetch: `AuthorPosts` uses `rxResource`, and the transfer cache is already off by the time the block hydrates lazily.
- DOM: the four server-rendered cards are preserved. Every card element kept its identity (tagged before scrolling) and a `MutationObserver` saw additions only during HTML parsing and no removals afterwards, so there is no flicker.

## Consequences

- The refetch is accepted: it is one cheap request, only for users who reach the block, and the API response is cacheable.
- Moving the deferred block's data into the route resolver would remove the request but would also remove the point of deferring it; revisit only if the block grows costly.
- The E2E suite guards the main guarantee (no API calls during `/feed` hydration). The `/p/:id` refetch behavior is documented here, not asserted.
