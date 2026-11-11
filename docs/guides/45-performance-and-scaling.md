# Guide 45 — Performance & Scaling

Performance work is measurement plus one deliberate change at a time. Ndigo
keeps the hot paths small — a radix route lookup, a single dispatch pipeline,
isomorphic views — but the expensive parts are still application decisions:
what you render, what you cache, how many nodes run, and how much telemetry you
emit.

This guide gives the levers and the measurement workflow. It deliberately does
not publish universal numbers: measure your app, on your hardware, with a
production build.

**Audience:** Node and browser application developers and operators · **Prerequisites:** Guides 01 and 02 · **Reference app:** `apps/05-ndigo-api`, `apps/19-ndigo-hn`, `apps/17-ndigo-telemetry-lab`

## What you'll learn

- Set a budget and measure the baseline before changing code.
- Identify the request-path, rendering, network, data, and runtime costs.
- Use the repository's benchmark lanes correctly.
- Scale with clustering and shared stores without multiplying state.
- Keep telemetry and logging from becoming the bottleneck.

## 1. Measure first

Define the budget in user terms first — p50/p95 request latency, TTFB, LCP/INP,
bundle size per route, jobs per second, memory per slot — then measure:

| Layer | Tool |
| --------------------- | ---------------------------------------------------------------------- |
| Micro hot paths | `pnpm test:bench` (serial Vitest benchmarks; JSON artifacts) |
| Baseline comparison | `pnpm bench:compare` (newest artifact vs committed reference baseline) |
| DOM/render comparison | `pnpm test:benchmark:react`, `:vanilla` (jsdom approximation) |
| Browser app baseline | Quarantined until a real-browser runner lands; see `BENCHMARKS.md` |
| Node CPU | `node --cpu-prof` / `--prof`, or `perf` |
| Browser runtime | Performance panel, `PerformanceObserver`, Lighthouse |
| Load | your HTTP load tool against a production build |

Rules:

- **Production build, production mode.** Dev servers, source maps, and
 unminified bundles distort the result.
- **One variable per run.** Change routing, caching, or rendering separately.
- **Warm up and repeat.** JIT, connection pools, and caches need a few runs;
 report p50/p95, not a single best number.
- **Record the environment.** Hardware, Node version, slot count, Redis/local
 backends, and dataset size belong with the result.

## 2. Request path

The dispatcher is intentionally thin:

- **Route lookup** is a radix tree over the registered patterns. Keep the
 mapping table small and specific; a catch-all mapping still participates in
 every request.
- **Conditions** (query/matrix/method/access) filter candidates before the
 handler; extra conditions cost a comparison, not a second route lookup.
- **Binding and validation** are per-declared-parameter work. Bind only what
 the handler uses; a whole-body `dataBinderValue` is cheaper than ten named
 extractors when the handler needs the object anyway.
- **Interceptors** run in order for every matched route. Put cheap denials
 (auth, rate limit) before logging/transformation; do not do I/O in
 `preHandle` that the handler will repeat.
- **Serialization** is `JSON.stringify` for plain returns. Large object graphs
 cost proportionally; project to a DTO (guide 13) instead of returning
 persistence shapes.
- **No synchronous I/O in a handler.** Filesystem reads, crypto, and database
 calls belong in async APIs; a blocking call stalls the whole event loop for
 every concurrent request.

## 3. Rendering

The rendering choice dominates browser performance:

| Strategy | Strength | Cost |
| --------------- | ------------------------------------------------ | ------------------------------------ |
| SSR (EJS/React) | Fast first paint, content in HTML | Server CPU; hydration cost |
| Islands | Fast first paint, hydrate only interactive parts | Composition and model serialization |
| SPA | Simple client state after load | Empty first paint, larger initial JS |
| Static/edge | Cheapest request path | Build/deploy pipeline |

Levers:

- **Hydrate only what is interactive.** An island that is below the fold or
 non-interactive should not be hydrated; defer it until visible/idle.
- **Keep the model small.** The island model is serialized into the HTML;
 sending the whole page model to every component multiplies bytes.
- **Per-component imports.** Import only the UI components a page uses; a
 barrel import pulls the whole library into the bundle.
- **Split routes.** Vite code-splitting keeps the initial bundle to the shell
 plus the active route.
- **Avoid layout thrash.** Batch DOM reads/writes; do not measure layout in a
 render loop.
- **Fonts/images** — preload the critical font, set dimensions on images, and
 use modern formats; layout shift is a performance metric too.

SSR shifts work to the server: measure TTFB and server CPU separately from TTI.
An SSR page that hydrates a huge tree can be slower to interact than a small
SPA.

## 4. Network and static assets

- **Compression** — serve precompressed `.br`/`.gz` twins; the static handler
 negotiates them and sends `Vary: Accept-Encoding` (guide 10).
- **Caching** — hashed assets get a long `Cache-Control`; HTML gets a short or
 no-cache policy. ETag/conditional GET avoids re-sending unchanged files.
- **Ranges** — large media benefits from single-range support; do not disable
 it unless you have a reason.
- **HTTP/2** — the Node listener supports h2 with an HTTP/1.1 fallback; HTTP/3
 stays at the edge. Multiplexing reduces connection overhead for many assets.
- **CDN** — put static assets behind a CDN when the app is multi-region; the
 framework's ETag/Range semantics survive a caching proxy.
- **SSE/streaming** — disable proxy buffering for `text/event-stream`; a
 buffered stream looks like a slow response (guide 16).
- **Keep-alive** — reuse connections between services; creating a client per
 request pays TLS and handshake every time.

## 5. Data and caches

Use the cheapest layer that can answer correctly:

1. **In-process memory** — `@cached`/`memoize` for pure or TTL-safe results
 (guide 19). Beware unbounded keys; use the bounded store.
2. **Shared Redis** — the same contracts when multiple slots/nodes must agree
 (guide 21). Redis adds a network hop; it is not free.
3. **Database** — indexes, pagination, and projections. Fetch only the columns
 a response needs; avoid N+1 queries (batch/join where the repository
 supports it).
4. **Outbox/jobs** — move slow side effects off the request path (guide 22).

Invalidation is the hard part:

- Cache a **key with a version** (or a short TTL) when writes are frequent.
- Invalidate explicitly after a write; do not rely on TTL for correctness.
- A per-process cache multiplies with cluster slots; use the shared store for
 cross-slot correctness.

## 6. Runtime and scaling

- **Cluster slots** — `ndigo serve --cluster N` uses the cores; each slot is a
 separate process with its own memory and in-process state (guide 25).
- **Shared state** — caches, rate-limit counters, locks, jobs, and WebSocket
 fan-out need the shared drivers when slots/nodes must agree (guides 16/21/24/28).
- **Connection pools** — one owned pool per process, not per request; borrowed
 clients stay open for the app lifetime and close once.
- **Node memory** — set a realistic `--max-old-space-size` per slot; measure
 RSS, not just heap. A crash-loop after OOM is a sizing bug.
- **Telemetry** — sampling, exporter batching, and metric cardinality matter.
 A per-request span with a high-cardinality attribute (user id, URL with ids)
 inflates every backend; use route patterns, not raw paths (guide 32).
- **Logging** — debug logs in a hot loop are a synchronous cost; use levels and
 structured fields, not string concatenation per request.

## 7. Benchmark lanes

```bash
pnpm test:bench                 # serial micro benchmarks; writes benchmarks/results/*.json
pnpm bench:quick                # one run, no baseline comparison
pnpm bench:compare              # compare the newest artifact to the reference baseline
pnpm bench:report               # render the newest artifact as Markdown
pnpm test:benchmark:react       # jsdom approximation (works for React)
pnpm test:benchmark:vanilla     # jsdom approximation (works for vanilla JS)
pnpm test:benchmark:ndigo       # quarantined: jsdom cannot run the module-script bundle
pnpm test:benchmark:svelte      # quarantined
pnpm test:benchmark:vue         # quarantined
```

The authoritative methodology, environment, and published results live in
[`BENCHMARKS.md`](../../BENCHMARKS.md). Read them for **relative** changes in the
same run/environment. A micro benchmark does not predict HTTP throughput; a
jsdom approximation does not predict browser layout or paint. Keep a small
app-level load test for the path you actually ship.

## 8. Checklist

- [ ] Budgets written down (latency, TTFB, LCP/INP, bundle, memory).
- [ ] Baseline measured on a production build.
- [ ] Route table and interceptors reviewed for unnecessary work.
- [ ] Rendering strategy chosen per page; only interactive islands hydrate.
- [ ] Per-component imports and route splitting in place.
- [ ] Static assets compressed, cached, and fingerprinted.
- [ ] Cache hierarchy and invalidation documented.
- [ ] Queries indexed/paginated; no N+1 on hot endpoints.
- [ ] Cluster/shared-state decision made before scaling out.
- [ ] Telemetry sampling and metric cardinality reviewed.
- [ ] A repeatable load test exists for the critical endpoint.

## 9. Pitfalls

- **Optimizing without a baseline.** You cannot prove the change helped.
- **Comparing micro and macro numbers.** A faster `like` does not mean a
 faster API.
- **Dev-mode measurements.** Unminified bundles and source maps are not the
 product.
- **Per-process caches under clustering.** The hit rate looks great; the data
 is inconsistent.
- **Unbounded cache keys.** TTL alone does not bound memory.
- **High-cardinality metrics.** They cost more than the request they measure.
- **Hydrating everything.** A full-page hydration can erase the SSR benefit.
- **Leaving a blocking call in a handler.** One sync read stalls all requests
 on the slot.

## See also

- [Guide 10 — Static Files](10-static-files.md) — precompression, ETag, ranges
- [Guide 19 — Caching](19-caching.md) — memory cache and invalidation
- [Guide 21 — Persistence & Shared Stores](21-persistence-and-shared-stores.md) — Redis and ownership
- [Guide 25 — Clustering](25-clustering.md) — slots and per-process state
- [Guide 32 — Telemetry](32-telemetry.md) — sampling, exporters, cardinality
- [Guide 38 — Deployment & Production Readiness](38-deployment-and-production-readiness.md) — the production checklist
- [`@ndigo/dispatcher`](../../packages/ndigo-dispatcher/README.md) — the radix mapping
- [`@ndigo/cache`](../../packages/ndigo-cache/README.md) — the cache contracts
