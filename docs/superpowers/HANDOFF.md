# Handoff: how to resume plan execution

This file lets a fresh agent (without the previous session's context) continue where the last one stopped. **Update the "Current state" section at the end of each slice**, in the slice's own PR.

## Read in this order

1. `AGENTS.md` (rules: language, comments, SRP, KISS, git without co-authorship, no push/PR without a request).
2. `docs/superpowers/specs/2026-11-23-microblog-ssr-design.md` (approved spec).
3. `docs/superpowers/plans/2026-11-23-fase-1-microblog-publico.md`: the header up to the first slice heading, plus the next task.
4. This page.

## Current state

| Slice | Branch | Tasks | Status |
|---|---|---|---|
| CI Early pipeline | `ci/check-pipeline` | 19 (part) | Merged (PR #4) |
| A Foundation | `chore/scaffold` | 1-3 | Merged (PR #1) |
| B Config and database | `feat/config-db` | 4-6 | Merged (PR #2) |
| C Services and API | `feat/api` | 7-9 | Merged (PR #3) |
| D SEO, seed and integration | `feat/server-wiring` | 10-12 | Merged (PR #6) |
| E UI base | `feat/ui-base` | 13-15 | Merged (PR #7) |
| F Dynamic pages | `feat/ui-pages` | 16 | Merged (PR #8) |
| G E2E | `test/e2e` | 17 | In review (awaiting push and PR) |
| H Docker, CI and docs | `chore/delivery` | 18-20 | Next |

To find the exact point, check `git log --oneline main..HEAD` on the branch of the slice in progress and compare it with the plan's tasks.

Repository: https://github.com/heitorrsdev/ssr-microblog (private).

## Execution protocol

- **One subagent per task** (skill `superpowers:subagent-driven-development`), in series. The implementer prompt points to plan headings (the header up to the first slice heading, plus the task heading) instead of pasting the text.
- **Per-slice review:** when a slice's tasks are done, a reviewer checks conformance with the plan and code quality (SRP/KISS) before the checkpoint.
- **Node 24:** the default shell is Node 18. Every command starts with `eval "$(fnm env)" && fnm use 24`.
- **Git:** each slice is a branch off the updated `main`. Commits are in English, Conventional Commits, with no `Co-Authored-By` and no mention of AI, even if the environment suggests attribution (`AGENTS.md` prevails). `git add` with explicit paths. No push, amend or rebase without a request.
- **Slice checkpoint:** stop and ask the user for authorization to push and open a PR. The PR description is in English and has no attribution. Only start the next slice after the user says the PR was merged; then `git switch main && git pull`.
- **Prettier ignores `docs/`.** Do not format documents.
- **CI:** `.github/workflows/ci.yml` runs the same checks as the verification line below on every PR and on pushes to `main`. A slice PR is only merged with CI green. The `e2e` and `docker` jobs are added by the slice that introduces them (G and H).
- Verification before declaring done: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test --no-watch`, `pnpm test:server` (when there are server tests) and `pnpm build`, looking at the output.

## Points to confirm by running (plan B is in the plan)

`rxResource` (option names), `Cache-Control` precedence of the 404 between `RESPONSE_INIT` and the route's `headers`, `pino` bundling, native build in Docker, and transfer cache reuse in E2E.

## After phase 1

`superpowers:finishing-a-development-branch`, then brainstorming for phase 2 (session login, create post, likes).

## Notes for slice H (from slices F and G)

- ADRs 0004 (navigation errors render a 500 page) and 0005 (hydration reuses server data) already exist. Task 20's ADRs 0001-0003 keep their planned numbers.
- The `e2e` CI job already exists (slice G). Task 19 only needs to add the `docker` job.
- Running E2E locally needs Chromium's system libraries: `sudo pnpm exec playwright install-deps chromium`.
- Navigation errors render `/erro` with status 500. If the API recovers between the server render and hydration, the client may render a different page over the error page's DOM. This is transient and only worth noting.
- Error logs from the Angular side go to the console through `ErrorHandler`, not to `pino`.
- Deferred minor items: `AuthorPosts` fetches its own data but sits in `shared-ui`; out-of-range `?page=` returns 200 with an indexable canonical; the read API sets no `Cache-Control` (weak ETag only).
