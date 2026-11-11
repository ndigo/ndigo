# Ndigo Benchmarks

This is the authoritative record for Ndigo's performance measurements. It
states what is measured, how to reproduce it, what the numbers do and do not
prove, and where the raw artifact lives.

The harness and its contributor rules live in
[`benchmarks/README.md`](benchmarks/README.md). The current estate audit and
refresh plan are
[`docs/audits/2026-11-10_BENCHMARK_ESTATE_AUDIT.md`](docs/audits/2026-11-10_BENCHMARK_ESTATE_AUDIT.md)
and [`docs/plans/2026-11-10_BENCHMARK_REFRESH.md`](docs/plans/2026-11-10_BENCHMARK_REFRESH.md).

## How to run

```bash
pnpm bench            # full serial run; writes benchmarks/results/<date>-<commit>.json
pnpm bench:quick      # one run, no baseline comparison
pnpm bench:compare    # compare the newest artifact to benchmarks/baselines/reference.json
pnpm bench:report     # render the newest artifact as Markdown
pnpm build            # required once for the macro HTTP app's built packages
pnpm bench:http       # Ndigo vs Fastify/Express/Hono, connection-close
pnpm bench:start      # cold start and RSS for the four HTTP apps
pnpm test:benchmark:react    # jsdom approximation (works for React)
pnpm test:benchmark:vanilla  # jsdom approximation (works for vanilla JS)
```

The Svelte, Vue, and Ndigo TodoMVC bundles use module-script features that
jsdom does not implement. Those commands fail fast with a quarantine message
until the real-browser runner lands (plan Phase 3). No jsdom numbers are
published for those targets.

## Methodology

- **Serial.** One benchmark file per process; `maxWorkers: 1`,
  `fileParallelism: false`, no shuffled order. The same LRU benchmark measured
  1,035 hz in the old parallel lane and 1,242 hz isolated; serial execution
  removes that contention.
- **One logical unit.** Every scenario reports `ns/op` (and `ops/s`) for one
  logical operation. `@ops=N` suffixes are normalized by the runner.
- **Semantic parity.** Each comparison calls `assertEquivalent` before timing.
  A mismatch fails the benchmark.
- **Comparators are pinned.** External versions are recorded in package
  manifests and in the artifact's commit.
- **Median + tail + RME.** The artifact keeps mean, p50/p75/p99/p999, RME, and
  sample count. Comparisons are considered only when both runs have RME ≤ 2%.
- **Reference host.** Absolute numbers are meaningful only on the recorded CPU
  class. Ratios are valid only within one run; the harness warns when the
  baseline CPU differs.

## Reference environment

| Field    | Value                                         |
| :------- | :-------------------------------------------- |
| CPU      | AMD Ryzen AI MAX+ 395 (16 cores / 32 threads) |
| OS       | Linux 7.0.0-42-generic                        |
| Node     | 24.22.0                                       |
| pnpm     | 12.16.1                                       |
| Governor | `performance`                                 |
| Vitest   | 5.1.0                                         |

The artifact records the actual values for every run; this table is the
committed reference class.

## Results

The clean serial baseline is
[`benchmarks/baselines/reference.json`](benchmarks/baselines/reference.json)
(run artifact `2026-11-11T17-32-40-d3fc4f3445fd.json`, commit `d3fc4f34`,
`dirty: false`, 191 scenarios, 319 s). It supersedes the pre-serial-harness
recording; regenerate it with `pnpm bench:update` whenever the harness or the
estate changes materially. All values are `ns/op` (lower is better); ratios use
the same artifact. The curated tables below are drawn from their own targeted
artifacts, named in each section; absolute numbers move with host state, so
compare ratios within a run.

### Routing parity — same work

`RadixTree.lookup` and the two external routers all look up a path and extract
the same `:params`.

| Scenario            | RadixTree | find-my-way | radix3 |
| :------------------ | --------: | ----------: | -----: |
| static `/users`     |     64.04 |       60.05 |  35.28 |
| param `/users/42`   |    163.32 |      217.00 | 228.37 |
| deep 4-segment      |    232.74 |      250.57 | 220.44 |
| miss `/nonexistent` |     50.26 |       23.97 |  71.41 |

RadixTree is 1.33× faster than find-my-way and 1.40× faster than radix3 on the
parameterized route; it is slower on the static route and route miss. It does
not support a general “faster than popular routers” claim.

### Routing — full handler resolution

`RadixMetadataHandlerMapping.getHandler` adds candidate filtering, route
conditions, mapping selection, and `route.pattern` decoration. It has no
external comparator because the other routers do not implement those
semantics.

| Scenario             | `getHandler` | Raw `RadixTree.lookup` |
| :------------------- | -----------: | ---------------------: |
| static `/users`      |       381.71 |                  64.04 |
| param `/users/42`    |       437.51 |                 163.32 |
| deep 4-segment       |       587.17 |                 232.74 |
| miss `/nonexistent`  |        65.31 |                  50.26 |
| three-route rotation |       658.35 |                      — |

Full resolution costs roughly 2.5–6.0× the raw lookup on the hit scenarios;
the miss is 1.3×. That is the price of the framework semantics and the number
to optimize, not the external-router ratio.

**Optimization (this branch):** candidate selection in
`RadixMetadataHandlerMapping._getHandler` was rewritten from
`filter()`+`reduce()` (an array allocation and two closures per request) to a
single-pass loop with identical winner semantics (ties keep the first
candidate; the 405 no-match path is unchanged). Same-host A/B, RME < 0.4%:
`getHandler(/users)` −8.1%, `(/users/42)` −8.5%, deep route −2.6%, rotation
−3.1%; the miss row is unchanged. 42/42 mapping specs pass. The deep-route
row remains radix/condition-bound — the next target is condition caching for
static routes.

**Optimization (this branch):** the matched pattern is now a normal optional
`Route.pattern` property assigned directly, instead of a non-enumerable
`Reflect.defineProperty`. The non-enumerable define forced every route object
into V8 dictionary mode, slowing later `route.path` / `route.params` reads.
Same-host A/B, RME < 0.4%: `getHandler(/users)` 306 → 197 ns (−36%), fresh
route object 373 → 202 ns (−46%), `/users/42` 356 → 229 ns (−36%), deep
430 → 320 ns (−26%), method-constrained 326 → 207 ns (−36%), rotation
388 → 259 ns (−33%); the miss and 405 rows are unchanged. 46/46 mapping specs
pass.

### Containers and parsers

| Scenario                   |   Ndigo | Comparator                       |                                Ratio |
| :------------------------- | ------: | :------------------------------- | -----------------------------------: |
| LRU `get` hit              |   31.07 | `lru-cache` 30.86                |                               parity |
| LRU `set` existing         |    8.33 | `lru-cache` 17.69                |                         2.13× faster |
| LRU `set` eviction         |  117.65 | `lru-cache` 102.52               | parity (both RME > 2%, inconclusive) |
| MultiValueMap `add`        |   13.74 | raw `Map` 13.34                  |                         1.03× slower |
| MultiValueMap `get`        |    5.58 | raw `Map` 5.60                   |                               parity |
| MultiValueMap `remove`     |   13.60 | raw `Map` 14.24                  |                         1.05× faster |
| RingBuffer FIFO put+get    |    4.99 | `Array` push/shift 23.71         |                         4.75× faster |
| RingBuffer bounded queue   |    4.52 | `Array` push/shift 8.20          |                         1.81× faster |
| RingBuffer `peek`          |    1.28 | `Array[0]` 0.43                  |                          3.0× slower |
| RingBuffer burst put       |    2.78 | circular array 0.29              |       9.6× slower (plain assignment) |
| Path matcher, warm cache   |   43.01 | compile RegExp 364.17            |                         8.47× faster |
| Path matcher, new instance |  130.90 | compile RegExp 375.92            |                         2.87× faster |
| Query parse                |  237.55 | `URLSearchParams` adapter 180.88 |                         1.31× slower |
| Query parse                |  237.55 | `qs` 1188.46                     |                         5.00× faster |
| Query stringify            | 1348.34 | `qs` 1578.10                     |                         1.17× faster |
| Cookie parse               |  825.63 | split+decode 253.60              |                         3.26× slower |
| Cookie parse               |  825.63 | `cookie` (values only) 125.47    |   6.6× slower, different fixture set |

The cookie parser and LRU `get` remain the clearest commodity-level
optimization targets. The ring buffer and path-matcher cache are clear wins
within their intended workloads.

**Baseline re-recorded on merged `main` after #382** (commit `0257ff63`, 186
scenarios). #382 replaced the Map-insertion-order LRU — whose tombstone-driven
eviction the estate's eviction row exposed — with a doubly-linked list. The
re-measure is decisive: `get` is at **parity** with `lru-cache` (31.07 vs
30.86 ns, previously 1.74× slower) and `set` on an existing key is **2.13×
faster** (8.33 vs 17.69 ns, previously 1.34× slower). The eviction row is
inconclusive (both runs RME > 2%). This is the estate's first
benchmark-driven structural fix landing upstream: finding → fix (#382) →
re-measure.

### Property index, context, bindings, and ORM

| Scenario                                           |                                       Ndigo | Comparator       |                              Ratio |
| :------------------------------------------------- | ------------------------------------------: | :--------------- | ---------------------------------: |
| Property index, representative                     |                                       21.70 | prototype 43.44  |                       2.00× faster |
| Property index, 32 sources                         |                                       12.49 | prototype 19.89  |                       1.59× faster |
| Property index, access mix                         |                                       12.74 | prototype 21.03  |                       1.65× faster |
| Property index, 1,000 keys                         |                                      542.91 | prototype 526.35 |                  parity (RME > 5%) |
| `getValue` bean1 / bean5                           |                               14.08 / 13.00 | —                |                           absolute |
| `getValue` via token                               |                                       14.16 | string 14.08     |                             parity |
| `hasValue` hit / miss                              |                                4.20 / 18.17 | —                |                           absolute |
| Dynamic context, 1 / 1,000 values                  |                               12.35 / 16.20 | —                |                           absolute |
| Dynamic context, 10 / 100 values                   |                               31.10 / 31.32 | —                | shape-sensitive; not an O(1) claim |
| Factory `getValue` warm / miss                     |                                4.97 / 23.96 | —                |                           absolute |
| Resolver lookup path                               |                                       29.32 | `Map.get` 2.90   |                       10.1× slower |
| Resolver lookup query                              |                                       84.13 | `Map.get` 2.86   |                       29.4× slower |
| `invoke` 0 / 1 path / 1 query / 3 mixed / 10 query | 116.47 / 180.92 / 175.42 / 322.15 / 1248.92 | —                |                           absolute |
| ORM persist insert / update                        |                         18.24 µs / 17.77 µs | —                |               RME > 2%; indicative |
| ORM `find` hit / miss                              |                             470.13 / 247.66 | `Map.get` 2.91   |                     absolute/floor |
| ORM `findAll` 1,000 / 10,000 rows                  |                         218.89 µs / 2.19 ms | —                |                           absolute |
| ORM `remove` existing                              |                                      963.24 | —                |               RME > 2%; indicative |

The flat merged property index clears the AD-11 decision rule on the
representative, 32-source, and access-mix workloads. ORM writes were the
largest per-operation cost in the estate and the target of the next deep
optimization pass; the schema-cache change below removes that cost.

**Optimization (#402):** instance registrations now keep a `Map<string, unknown>`
alongside the own property, so `getValue`'s hot path reads the Map instead of a
megamorphic own-property lookup (factory shapes vary with the context's value
count). Same-host A/B, serial lane, two runs: bean lookups 19.6 → 8.6–10.1 ns
(−49 to −56%), `ContextToken` 19.75 → 10.2 ns, dynamic 1/1,000 values
17.4–19.3 → 11.8–13.1 ns (−32 to −36%), 10/100 values −45 to −51%.
`hasValue` hit moves 2.4 → 3.5–3.6 ns (still under 4.5), miss unchanged. The
Map shares lifetime with the property: `destroyValue` and the proxy delete
trap remove both.

**Optimization (this branch):** `schemaForEntity` / `insertSchemaForEntity`
memoize the derived Zod schema per entity class in module-level `WeakMap`s
instead of rebuilding `z.object` from metadata on every `persist`. Same-host
A/B, serial lane: `persist(new entity)` 15.16 µs → 735 ns (20.6×),
`persist(existing entity)` 14.64 µs → 441 ns (33.2×), `persist × 100`
14.91 µs → 692 ns (21.5×). The before rows carry RME 2.2–2.8% (the old path
allocates a schema per write); the after rows are RME < 0.3%, and the delta is
an order of magnitude beyond either error bar. Cached `safeParse` is the
remaining cost at 31–52 ns per insert. 133/133 `@ndigo/orm` tests pass.

**Optimization (this branch):** `RouteHandlerMethod.invoke` caches the resolved
route mapping per handler instance and returns immediately for zero-parameter
handlers (the whole error-handler path), before touching the polyfill metadata
proxy. Same-host A/B, RME < 0.3%: `invoke` 0 params 99 → 3 ns (33×), 1 path
param 173 → 57 ns (−67%), 1 query param 176 → 61 ns (−65%), 3 mixed
329 → 220 ns (−33%), 10 query 849 → 700 ns (−17%).

### `like` and error construction

| Scenario                              |              Ndigo | Comparator                      |
| :------------------------------------ | -----------------: | :------------------------------ |
| `like` cached valid / null / mismatch | 2.55 / 0.33 / 2.10 | hand-written `typeof` 0.28      |
| `like` two-arg valid / null           |      25.25 / 23.54 | —                               |
| `like` fresh descriptor               |    464.47 / 429.24 | RME > 13%; inconclusive         |
| `FrameworkError`                      |            2562.97 | native `Error` 2576.15 (parity) |
| `FrameworkError` with cause           |            2885.14 | native `Error` 2594.08 (+11.2%) |

Scenarios above 2% RME are marked inconclusive and excluded from headline
claims; they remain in the artifact and the baseline comparator skips them.

### End-to-end HTTP (connection-close)

The macro lane runs the same four routes in Ndigo, Fastify, Express, and Hono,
one app at a time, with 50 concurrent connections for 3 s over two runs. The
artifact is `http-2026-11-11T01-37-35.json`.

| Scenario             |  Ndigo | Fastify | Express |   Hono |
| :------------------- | -----: | ------: | ------: | -----: |
| `GET /json`          | 24,835 |  39,957 |  29,973 | 20,805 |
| `GET /users/:id`     | 24,035 |  39,925 |  16,827 | 21,403 |
| `POST /echo` (1 KB)  | 19,933 |  38,464 |  13,584 | 19,312 |
| `GET /missing` (404) | 36,939 |  40,117 |  16,667 | 24,936 |

Values are requests per second. Fastify leads every scenario in this mode.
Ndigo is second on `POST /echo` and the 404, and behind Express on the two GET
routes. This is **not** a production throughput claim:

- Connections use `Connection: close`. Ndigo's chunked responses make
  autocannon's keep-alive status counter report false 5xx results, so the first
  lane measures connection-per-request throughput for every target. A
  keep-alive lane needs a load generator verified against chunked responses.
- Ndigo runs from source through `tsx`; the framework packages are built to
  `lib/` first. Fastify/Express/Hono run native JavaScript.
- The ~750 ms mean latency reported by autocannon is dominated by connection
  setup in this mode, so only the request rate is shown.

### Binding, validation, and cold start

Binding rows measure the Node platform's argument resolvers with a pre-parsed
body (no `JSON.parse` or socket I/O); the Zod rows run the `validatedBy`
converter end to end through `NodeBodyValueMethodArgumentResolver`. The
artifact is `2026-11-11T01-57-17-3670f9cccfca.json` (commit `3670f9ccc`).

| Scenario                                         |       Metric |
| :----------------------------------------------- | -----------: |
| bind whole body                                  |  43.48 ns/op |
| bind dotted body (`address.city`)                | 149.85 ns/op |
| `validatedBy(Zod)` — valid object                |  71.90 ns/op |
| `validatedBy(Zod)` — invalid object (error path) | 10,288 ns/op |
| `validatedBy(Zod)` — dotted field                | 195.32 ns/op |

Valid binding is cheap; the **invalid path costs ~110× the valid path**
because `safeParse` allocates the full issue list and throws a framework
error. Request-rejection traffic pays that cost per request.

**Optimization (this branch):** `validatedBy` memoizes the normalized failure
for the three empty-body shapes per schema (`{}`, `null`, `undefined`). A
nullish body fails from the template before parsing; a keyless plain object is
classified only after the parse has already failed, so valid bodies pay no
emptiness check. Same-host A/B, two serial runs per side: `{}` 10.47 → 9.46–9.71
µs (−7 to −10%), `undefined` 10.23–10.44 → 8.90–9.00 µs (−12 to −14%), valid
67–68 → 65–75 ns (run-to-run layout noise; no added cost on the valid path).
The remaining ~8.9 µs was the two `Error` stack captures, addressed below.

**Optimization (AD-103, #403):** the `ZodValidationError` cause is built with
`Error.stackTraceLimit` scoped to zero and restored in `finally`, so the
failure carries one stack — the thrown `ParameterConversionError`'s. Same-host
A/B, serial lane, two runs on the after side: invalid non-empty 10.95 →
7.33–7.39 µs (−33%), empty `{}` 9.69 → 6.23–6.47 µs (−33 to −36%),
`undefined` body 9.33 → 5.69–5.80 µs (−38 to −39%), valid 66–68 → 66–68 ns
(unchanged). The rejection/valid ratio falls from ~166× to ~110×. The empty
`{}` after row carries RME 1.7–2.1%; the others are RME < 2.4%.

Cold start (`pnpm bench:start`, 3 runs, median; artifact
`startup-2026-11-11T01-56-06.json`, commit `3670f9ccc`):

| Target  | Time-to-listen | RSS after 200 requests |
| :------ | -------------: | ---------------------: |
| Ndigo   |         379 ms |                 127 MB |
| Fastify |          75 ms |                  77 MB |
| Express |          75 ms |                  71 MB |
| Hono    |          50 ms |                  68 MB |

The Ndigo number includes `tsx` source loading, not a bundled production
build; it is an upper bound on startup cost, not a shipped-artifact claim.

### Cache and flags (Phase 4)

`@ndigo/cache` `MemoryCache` (async contract) and `@ndigo/flags`
`PropertyFlagProvider` (async, never-throw). Artifacts
`2026-11-11T02-34-57-f71aea3202ca.json` (cache) and
`2026-11-11T02-35-37-f71aea3202ca.json` (flags), commit `f71aea320`.

| Scenario                                                 |   ns/op |                  RME |
| :------------------------------------------------------- | ------: | -------------------: |
| MemoryCache get hit                                      |  125.33 | 2.73% (inconclusive) |
| MemoryCache get miss                                     |   72.47 |                0.25% |
| MemoryCache set existing                                 |   59.76 |                0.18% |
| MemoryCache delete hit                                   |  110.01 |                1.60% |
| MemoryCache set evict (maxSize 16)                       |  127.75 | 5.78% (inconclusive) |
| memoize hit                                              |  313.88 |                0.24% |
| memoize miss                                             |  427.73 |                0.23% |
| PropertyFlagProvider evaluate boolean true               |  167.97 |                0.20% |
| PropertyFlagProvider evaluate boolean missing (default)  |  102.08 |                0.22% |
| PropertyFlagProvider evaluate string                     |   94.20 |                0.21% |
| PropertyFlagProvider evaluate number                     |  132.06 |                0.22% |
| PropertyFlagProvider evaluate rollout (50% bucket)       |  334.70 |                0.27% |
| PropertyFlagProvider evaluate throwing reader (no-throw) | 2299.54 |                0.25% |

Notes: `get hit` is inconclusive at 2.73% RME; the eviction row is
inconclusive at 5.78%. The throwing-reader path costs ~14× the normal
evaluate path — the no-throw contract is not free. No comparator is
published for either package (no upstream baseline in the estate).

### Media-type interning / Deque eviction (PR #382)

PR #382 replaced the array shift with a `Deque` for O(1) FIFO eviction in the
media-type intern caches (`@ndigo/core`). The like-for-like row wraps an
identical FIFO cache — same `Map` set/delete, same key workload — differing
only in the order structure. Artifact
`2026-11-11T03-05-47-0257ff63b2d7.json` (commit `0257ff63`, artifact run was dirty — file untracked at run time; values rerun clean in the estate lane).

| Scenario                                             |    ns/op |                  RME |
| :--------------------------------------------------- | -------: | -------------------: |
| `parseMediaType` intern hit                          |   368.16 |                0.42% |
| `parseMediaType` intern churn (512 keys, evict >128) | 1,057.09 | 6.11% (inconclusive) |
| Deque FIFO (shift evict)                             |    36.06 |                0.93% |
| array FIFO (shift evict)                             |    98.59 |                0.79% |

**Verified:** the Deque eviction is **2.73× faster** than the array-shift
under churn (36.06 vs 98.59 ns, both RME < 1%). The real intern path churn
row is inconclusive (parse work dominates the eviction difference and RME is
6.1%), so the claim rests on the like-for-like row. The `intern hit` row is
parse+lookup, not lookup alone.

### View serializing views (Phase 4)

`@ndigo/view` whole-document (`renderTo`) mode for JSONView and CSVView.
Artifact `2026-11-11T02-57-50-b171f4607c0c.json` (commit `b171f460`).
`renderTo` is async, so rows include one promise per render.

| Scenario                              |    ns/op |   RME |
| :------------------------------------ | -------: | ----: |
| JSON.stringify (same work)            |   243.01 | 0.21% |
| JSONView.renderTo                     |   277.48 | 0.41% |
| CSVView.renderTo (1 row)              |   295.87 | 0.17% |
| CSVView.renderTo (20 rows)            | 2,853.88 | 0.34% |
| template floor (20 rows, no escaping) |   447.65 | 0.29% |

Notes: the JSON view costs ~14% over `JSON.stringify` — the async wrapper
and `RenderResult` construction, an attributable view-layer overhead. CSV
cost scales ~linearly with rows and is ~6.4× the no-escaping floor on this
no-special-characters fixture; escaping is the cost.

### Resilience woven interceptors (Phase 4)

`@ndigo/resilience` retry and circuit-breaker interceptors, applied through
`@ndigo/proxy` `interceptMethods` with method annotations — the application
wiring path. Artifact `2026-11-11T02-54-44-84b94b208602.json` (commit
`84b94b20`).

| Scenario                                     |               ns/op |   RME |
| :------------------------------------------- | ------------------: | ----: |
| plain async call (unwoven)                   |               25.45 | 0.19% |
| woven success (breaker + retry pass-through) |              695.32 | 0.20% |
| retry exhaust (3 attempts)                   | 2,125,849 (2.13 ms) | 0.09% |
| open circuit fast-fail                       |            4,319.63 | 0.25% |

Notes: the woven pass-through costs ~27× the unwoven call (chain invocation,
annotation resolution, per-method circuit cells, two interceptor layers — and
the proxy wrapper). The retry-exhaust row is dominated by the 3 error
constructions plus 2 backoff awaits, not the interception logic. The open
circuit fast-fail is cheap (single cell lookup then `CircuitOpenError`).

### Socket STOMP frame codec (Phase 4)

`@ndigo/socket` STOMP 1.2 message hot path. Every fixture is round-trip
verified before timing; byte-wire frames keep binary bodies (codec D8).
Artifact `2026-11-11T02-49-…json` (see `bench:report`), commit `850f92983`.

| Scenario                            |   ns/op |                  RME |
| :---------------------------------- | ------: | -------------------: |
| serializeStompFrame (text body)     |  907.67 |                0.24% |
| template floor (no escape/validate) |    0.55 |                0.05% |
| parseStompFrame (text wire)         | 1090.23 |                0.50% |
| parseStompFrame (byte wire)         | 2223.72 | 2.22% (inconclusive) |
| serialize 2KiB body                 |  999.95 |                0.15% |
| parse 2KiB body                     | 1075.32 |                0.13% |

Notes: escaping/validation/codec work makes serialization ~1650× the
template floor — expected, the floor is less work, not an alternative.
Body size barely moves the cost (validation dominates, not copying).

### Rate limit, locks, and log (Phase 4)

`@ndigo/rate-limit` `FixedWindowRateLimiter`, `@ndigo/locks`
`InProcessLockDriver`, and `@ndigo/log` dispatch. Artifacts
`2026-11-11T02-44-57/02-45-01/02-45-07-9668994c6959.json` (commit
`9668994c6`).

| Scenario                                  |  ns/op |                  RME |
| :---------------------------------------- | -----: | -------------------: |
| RateLimit consume allowed (64 keys)       | 169.98 |                0.24% |
| RateLimit consume denied (limit 1)        | 104.50 |                0.14% |
| RateLimit consume distinct keys (10k cap) | 171.18 |                0.17% |
| Locks acquire+release (uncontended)       | 557.50 | 2.68% (inconclusive) |
| Locks acquire contended (null path)       |  97.09 |                0.18% |
| Locks renew                               |  94.62 |                0.17% |
| Log noop info()                           |   0.23 |                0.05% |
| Log ConsoleLogger disabled info()         |  17.27 |                0.08% |
| Log ConsoleLogger isEnabled (disabled)    |  16.73 |                0.05% |

Notes: the lock acquire+release row is inconclusive at 2.68% RME. Log rows
pin the **disabled** dispatch cost only — the enabled write path is
synchronous console I/O and would be dominated by the sink, so it is not
measured. No upstream comparators exist for these packages; all rows are
internal cost.

### Signals event bridges (Phase 4)

`@ndigo/signals` re-exports the `@preact/signals-core` engine, so these rows
measure only the shipped bridge wrappers. Artifact
`2026-11-11T02-13-13-efa2f92b06e5.json` (commit `efa2f92b0`).

| Scenario                  |                                                         Metric |
| :------------------------ | -------------------------------------------------------------: |
| `eventsToSignal` delivery |                                4.19 ns/event (238.4M events/s) |
| `signalToEvents` delivery | 42.1 ns/change (23.7M changes/s; **RME 10.2% — inconclusive**) |

Decorated read costs **5.70 ns/op vs 1.03 ns/op raw — a 5.5× wrapper
overhead** (RME 0.05% / 0.03%). `@effect` fires at **43.37 ns/op per
change** (RME 0.14%); `signalToEvents` is inconclusive at 48.06% RME.
The earlier "context is undefined" failure was not a plugin bug: `@signal`
is a decorator, not a factory, so the bench had to use `@signal` (no call
parens) rather than `@signal()`. The `lowerDecorators()` plugin (esbuild,
ES2022) lowers field decorators correctly. Artifact
`2026-11-11T02-33-06-f8d35703af8d.json` (commit `f8d35703a`).

## What this does not prove

- **Micro ≠ macro.** A dispatcher lookup benchmark does not predict HTTP
  requests per second.
- **Single host.** Absolute numbers do not transfer across CPU classes.
- **jsdom ≠ browser.** The jsdom TodoMVC harness has no layout or paint phase.
- **Different semantics are not alternatives.** A row labelled “floor” does
  less work than the candidate; its ratio is not a like-for-like claim.
- **No cross-run cherry-picking.** A published ratio cites one artifact and
  one environment.

## Claim policy

A package README may contain at most one sentence plus a link to this document.
A numeric claim must cite the scenario, commit, date, environment, comparator
version, unit, and artifact. Losses are published alongside wins. A claim is
re-measured when its benchmark, comparator, Node major, or hardware class
changes, and expires after 90 days otherwise.
