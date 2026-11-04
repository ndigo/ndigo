# @ndigo/hn — Hacker News Reader

A Hacker News client built on the Ndigo browser stack, over the official
[Hacker News API](https://github.com/HackerNews/API). Inspired by the archived
[hnpwa.com](https://hnpwa.com/) reader concept (inspiration only — the API here
is the current official Firebase one).

The point of the app is the client's **cache and offline story** and **long-list
rendering**: a feed returns hundreds of ids, so it hydrates them through the
`@ndigo/http` client with bounded concurrency, caches the responses with a TTL,
falls back to a persisted snapshot when the network is gone, and queues the
request for replay when the browser reconnects — all while rendering the list
incrementally.

## Run

```bash
cd apps/19-ndigo-hn && pnpm dev
# open http://127.0.0.1:3450/
```

A live run talks to the public HN API (`https://hacker-news.firebaseio.com/v0`),
so it needs working network access. Point it elsewhere with the `VITE_HN_API_BASE`
environment variable:

```bash
VITE_HN_API_BASE=https://hacker-news.firebaseio.com/v0/ pnpm dev
```

The dev/preview port is `3450` (override with `PORT`).

## Routes

| Route        | View      | Shows                                                           |
| ------------ | --------- | --------------------------------------------------------------- |
| `#/`         | `hn-list` | Top stories (`topstories`)                                      |
| `#/new`      | `hn-list` | Newest stories (`newstories`)                                   |
| `#/best`     | `hn-list` | Best stories (`beststories`)                                    |
| `#/ask`      | `hn-list` | Ask HN (`askstories`)                                           |
| `#/show`     | `hn-list` | Show HN (`showstories`)                                         |
| `#/jobs`     | `hn-list` | Jobs (`jobstories`)                                             |
| `#/item/:id` | `hn-item` | One story/job and its comment tree, rendered to a bounded depth |

Reloading `#/item/:id` restores the item from the persisted snapshot first
(then revalidates), so a deep link works offline.

**Deliberately out of scope** (this is a reader, not the full HN product):
search, user profiles, login/voting/submitting, pagination-by-page (the list
uses incremental chunks instead), and the poll/pollopt item types. The API
surface exercised is the six story feeds plus `item/:id`.

## Demonstrates

- **HTTP client cache + offline replay** (`@ndigo/http`,
  `@ndigo/platform-web`): `CacheInterceptor` (TTL) answers repeat requests,
  `RetryOnOfflineInterceptor` queues a request made offline and replays it on
  reconnect, and a localStorage-backed snapshot store serves a **stale** copy
  with its age so the UI can say so. The connection banner shows the current
  provenance — online, served-from-cache, stale, or offline.
- **Router + deep links** (`@ndigo/router`, `@ndigo/platform-web`): a `HashRouter`
  dispatches to `@routeMapping` controllers; `#/item/:id` binds the id through
  `@parameters`/`pathVariable`.
- **Signals** (`@ndigo/signals`): the service owns the feed/item/connection
  signals and the views subscribe with `effect`, so hydration, `load more`, and
  a stale→live revalidation all re-render in place.
- **Long-list rendering**: bounded-concurrency hydration with incremental
  `IntersectionObserver` (or a button fallback) rendering, loading skeletons,
  and per-row failure degradation.
- **Bounded comment trees**: comments are fetched to a fixed depth under a total
  node budget — no unbounded recursion over a huge thread.
- **Browser telemetry** (`@ndigo/telemetry-web`): console-exported spans around
  feed and item loads (`hn.feed.load`, `hn.item.load`).

## Tests

```bash
cd apps/19-ndigo-hn && pnpm test   # vite build, then vitest run
```

All specs stub the HN API with
[msw](https://mswjs.io/) (`test/support/hn-fixtures.ts`); no test touches the
live network, so the suite is deterministic. Coverage:

- `test/hn-api.spec.ts` — list/item fetches, HTTP cache TTL behaviour, stale
  snapshot fallback while offline, snapshot persistence, `500` error surfacing.
- `test/hn-service.spec.ts` — hydration order, incremental windows, bounded
  comment trees, error/retry, offline → queued replay → live.
- `test/routes.spec.ts` — the route table and the cache-backed item deep link
  through the real dispatcher pipeline.
- `test/concurrency.spec.ts` — the bounded-concurrency primitive.
- `test/bundle.spec.ts` — the built bundle parses as an ES module (no raw
  decorators).

Unlike the live run, the tests never hit the public API. To exercise a live
list + item flow, run `pnpm dev` with network access.

## See Also

- [apps/README](../README.md) — the applications progression
- [07-ndigo-views](../07-ndigo-views/README.md) — the HTTP client cache + offline
  queueing demo this app builds on
- [11-ndigo-conduit-web](../11-ndigo-conduit-web/README.md) — the other
  hash-routed browser app
- [guide 20 — the HTTP client](../../docs/guides/20-http-client.md)
- [guide 18 — signals & islands](../../docs/guides/18-signals-and-islands.md)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
