# Benchmark Estate Audit — 2026-11-10

**Scope:** the 15 committed Vitest benchmark files, the two browser/DOM
harnesses, the scripts that expose them, and every performance claim those
artifacts are used to support.

**Snapshot:** `main` at `134f62f16` (2026-11-10 16:24 -0500), run
2026-11-10 16:43–16:48 EST.

**Environment:** Node 24.22.0; pnpm 12.16.1; Linux 7.0.0-42-generic;
AMD Ryzen AI MAX+ 395 (16 cores / 32 threads); `performance` CPU governor;
120 GB unified RAM; Vitest 5.1.0.

> **Read this first:** the numbers below are an _indicative_ snapshot, not
> publication-grade evidence. The committed lane runs benchmark files in
> parallel inside `jsdom`, emits no machine-readable artifact, and records no
> environment fingerprint. The same LRU benchmark measured 1,035 hz in the
> full lane and 1,242 hz in an isolated single-file run — the full lane was
> 17% lower because of contention alone. Fixing that is Phase 0 of the plan.

---

## 1. Executive summary

The benchmark estate is broad but ungoverned. Fifteen files cover useful hot
paths, and one of them (`property-lookup.bench.ts`) is a model of how the
whole suite should work: a committed workload, a pre-committed decision rule,
module-level fixtures, and a stated engine limitation. Most of the others are
exploration scripts that were never converted into regression benchmarks.

The material findings:

1. **The lane is not reproducible.** `pnpm test:bench` runs all files in
   parallel, uses the `jsdom` environment for pure Node microbenchmarks, writes
   no result file, records no commit/hardware/Node fingerprint, and is absent
   from CI. A result cannot be audited or compared across runs.
2. **Benchmark files are excluded from typechecking.** `tsconfig.spec.json`
   excludes `**/bench/**`; the files compile only by accident. Several already
   contain stale references and local copies of code that no longer ships.
3. **A public claim is contradicted by its own benchmark.**
   `packages/ndigo-dispatcher/README.md:46` says route lookup is “3–6x faster
   than popular router libraries on parameterized paths.” The current
   `routing.bench.ts` shows full `getHandler` resolution at **1.72 Mops/s**
   versus find-my-way at **14.13 Mops/s** and radix3 at **8.01 Mops/s** on the
   parameterized route — ndigo is 4.6–8.2× slower on that scenario, not 3–6×
   faster. The comparison is not even like-for-like: ndigo resolves conditions
   and decorates the route object while the external routers only look up a
   path, but that makes the claim harder to defend, not easier.
4. **The browser lane is dead.** The workspace points at
   `../todomvc/examples/ndigo`, which does not exist (the example directory is
   `bluejs`); `benchmark-preview.mjs` filters `@ndigo/todomvc`, but the sibling
   package is `@blue/todomvc`; `benchmark-dom.ts` has no ndigo target at all.
   The two harnesses also measure different things: one is jsdom (no layout or
   paint), the other is a Playwright runner in the sibling repository.
5. **Several comparisons do not compare equal work.** The query-string and
   cookie baselines do less work than the ndigo path; the multi-value-map “get”
   and LRU “hot path” scenarios build/warm their fixtures inside the measured
   body; the path-matcher cache scenario constructs a new matcher per
   iteration, which hides the steady-state cache benefit.
6. **The largest optimization leads are visible in the data**: dispatcher
   resolution is ~525 ns/op versus ~22–27 ns/op for raw routers; ORM update
   persist is ~22.8 µs/op; `getValue('entry5')` is 2.5× slower than
   `getValue('entry1')`; resolver lookup by `Array.find` is 8–27× slower than a
   `Map` lookup; LRU `get` costs ~96 ns/op.
7. **No benchmark results are documented.** The only prose artifacts are a
   Ramda-era audit whose benchmark files were deleted (AD-84) and a guide that
   still describes the micro lane as “`like()`/errors, spread.” There is no
   `BENCHMARKS.md`, no results table, no reproduction command, and no expiry
   policy for claims.

The `routing.bench.ts` history explains the false claim: the 40–63× figure in
`docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md:83` measured radix against the
now-deleted `LinearMetadataHandlerMapping`, not against find-my-way or radix3.
Both remaining rows in `routing.bench.ts` instantiate
`RadixMetadataHandlerMapping` (`routing.bench.ts:70,74`), so the “baseline” row
is a duplicate of the candidate row.

---

## 2. Inventory

`pnpm test:bench` at this commit: **15 files, 70 benchmark tests, 153 result
rows, 288.34 s**. 52 of the 153 rows (34%) are the local `like` exploration.

| File                                                         | Rows | What it measures                                     | Comparator                         | Verdict           |
| :----------------------------------------------------------- | ---: | :--------------------------------------------------- | :--------------------------------- | :---------------- |
| `packages/ndigo-core/bench/lru-cache.bench.ts`               |    2 | LRU set/get, with and without eviction               | none (self-comparison)             | Refresh           |
| `packages/ndigo-core/bench/multi-value-map.bench.ts`         |    6 | add/get/remove                                       | raw `Map<K, V[]>`                  | Refresh           |
| `packages/ndigo-core/bench/path-matcher.bench.ts`            |    2 | glob match with LRU cache vs recompile               | hand-written no-cache path         | Refresh           |
| `packages/ndigo-core/bench/radix-tree.bench.ts`              |   18 | lookup: static/param/deep/two-param/miss/scale       | `Map`, RegExp array                | Keep + expand     |
| `packages/ndigo-core/bench/ring-buffer.bench.ts`             |    8 | FIFO, burst, peek, bounded drop-oldest               | `Array` push/shift                 | Keep              |
| `packages/ndigo-core/test/benchmarks/bench.bench.ts`         |    6 | production `like`, error construction, object merge  | none / none / spread vs assign     | Move + refresh    |
| `packages/ndigo-context/bench/context-lookup.bench.ts`       |    6 | entry lookup, miss, `hasValue`, `keys`               | none                               | Refresh           |
| `packages/ndigo-context/bench/property-lookup.bench.ts`      |   13 | flat vs prototype index, 10/100/1,000 keys, mutation | strategy vs strategy               | **Keep as model** |
| `packages/ndigo-dispatcher/bench/argument-resolver.bench.ts` |    8 | resolver lookup, full invoke                         | Array.find vs Map, no external     | Refresh           |
| `packages/ndigo-dispatcher/bench/context-lookup.bench.ts`    |    6 | factory lookup, miss, `hasValue`, `keys`             | none                               | Consolidate       |
| `packages/ndigo-dispatcher/bench/routing.bench.ts`           |   15 | full handler resolution, 3 routes                    | find-my-way, radix3, duplicate     | Refresh + fix     |
| `packages/ndigo-http/bench/query-string.bench.ts`            |    2 | parse                                                | `URLSearchParams` (different work) | Refresh + fix     |
| `packages/ndigo-orm/bench/entity-manager.bench.ts`           |    7 | update-persist, find, findAll, remove                | none                               | Refresh + expand  |
| `packages/ndigo-platform-web/bench/cookie-parser.bench.ts`   |    2 | cookie parse                                         | split (no decode)                  | Refresh + fix     |
| `packages/ndigo-util/bench/like.bench.ts`                    |   52 | six local `like` implementations                     | each other                         | **Replace**       |

Coverage absent from `packages/*/bench` today: `ndigo-router` (the public router
surface), `ndigo-platform-node` (the actual HTTP adapter, body parsing,
multipart), `ndigo-view*` (SSR/islands), `ndigo-signals` (wrapper overhead),
`ndigo-socket` (envelope/fan-out), `ndigo-cache`, `ndigo-resilience`,
`ndigo-rate-limit`, `ndigo-locks`, `ndigo-flags`, `ndigo-log`,
`ndigo-telemetry*`, and the CLI/startup path.

---

## 3. Current snapshot (indicative)

Normalized to one logical operation where the source makes the inner loop
count explicit. “Mops/s” is millions of logical operations per second; the
underlying Vitest `hz` is batch throughput, not ops/s. **Ratio** is comparator
throughput divided by ndigo throughput, so 19.4× means the comparator is 19.4×
faster.

### 3.1 Routing

| Scenario             | Implementation      | Mops/s |  ns/op | Ratio vs ndigo |
| :------------------- | :------------------ | -----: | -----: | -------------: |
| static `/users`      | `getHandler` (full) |   1.91 | 524.82 |          1.00× |
| static `/users`      | find-my-way         |  36.89 |  27.11 |          19.4× |
| static `/users`      | radix3              |  44.82 |  22.31 |          23.5× |
| param `/users/42`    | `getHandler` (full) |   1.72 | 580.65 |          1.00× |
| param `/users/42`    | find-my-way         |  14.13 |  70.76 |           8.2× |
| param `/users/42`    | radix3              |   8.01 | 124.79 |           4.6× |
| deep 4-segment route | `getHandler` (full) |   1.41 | 709.70 |          1.00× |
| deep 4-segment route | find-my-way         |   9.96 | 100.80 |           7.1× |
| deep 4-segment route | radix3              |   6.54 | 153.40 |           4.6× |
| miss `/nonexistent`  | `getHandler` (full) |  11.80 |  84.70 |          1.00× |
| miss `/nonexistent`  | find-my-way         |  31.57 |  31.70 |           2.7× |
| miss `/nonexistent`  | radix3              |  12.78 |  78.30 |           1.1× |

`getHandler` does materially more work than a raw router: it looks up the
radix node, filters every candidate in `#candidatesByPattern`, applies route
conditions, selects the most specific mapping, calls `_handleMatch`, and
re-defines `route.pattern` with `Reflect.defineProperty` on every request. The
comparison therefore measures “full framework resolution” against “raw router
lookup.” That is a legitimate benchmark, but it is not a like-for-like router
comparison, and it cannot support a “faster than popular routers” claim.

The core radix tree, measured without dispatcher work, is honest about its
trade-off:

| Scenario              | `RadixTree.lookup` |     RegExp scan | Result       |
| :-------------------- | -----------------: | --------------: | :----------- |
| param `/users/42`     |  124 ns/op (8.05M) |  65 ns (15.29M) | 1.9× slower  |
| deep 4-segment route  |  245 ns/op (4.08M) |  83 ns (12.18M) | 2.9× slower  |
| two-param route       |  315 ns/op (3.18M) |  112 ns (8.96M) | 2.8× slower  |
| 20 registered routes  |  146 ns/op (6.87M) |  338 ns (2.97M) | 2.3× faster  |
| 50 registered routes  |  147 ns/op (6.83M) | 1.16 µs (0.86M) | 7.9× faster  |
| 100 registered routes |  144 ns/op (6.93M) | 2.42 µs (0.41M) | 16.8× faster |

The radix tree wins once the route table grows; it loses on tiny tables because
it allocates a params object and walks segment strings while a short regexp
scan exits after one or two patterns. Both facts belong in the documentation.

### 3.2 Request pipeline

| Scenario                              |        Metric | Note                                   |
| :------------------------------------ | ------------: | :------------------------------------- |
| `RouteHandlerMethod.invoke`, 0 params |     157 ns/op | baseline invocation with no resolution |
| 1 path param                          |     259 ns/op | `Array.find` hits resolver index 0     |
| 1 query param                         |     265 ns/op | resolver index 2                       |
| 3 mixed params                        |     473 ns/op | 3× scans + 3× extraction               |
| resolver lookup, path param           |    48.3 ns/op | `Array.find`                           |
| resolver lookup, path param           |     6.2 ns/op | `Map.get` (hypothetical optimisation)  |
| resolver lookup, query param          |   139.8 ns/op | `Array.find`                           |
| resolver lookup, query param          |     5.3 ns/op | `Map.get`                              |
| entry lookup `entry1`                 |    6.72 ns/op | warm singleton                         |
| entry lookup `entry5`                 |   16.85 ns/op | **2.5× slower than entry1**            |
| entry lookup via `ContextToken`       |    6.75 ns/op | pins the AD-34 D1 same-cost claim      |
| `hasValue` hit / miss                 | 6.6 / 27.8 ns | miss is 4.2× slower                    |

The resolver `Map.get` rows are not semantically equivalent to
`Array.find(supportsParameter)`: the resolver contract is a predicate, not a
type key. They are useful as an upper bound on the selector overhead, not as a
drop-in replacement.

### 3.3 Parsers and containers

| Scenario                   | Implementation        |      ns/op | Note                              |
| :------------------------- | :-------------------- | ---------: | :-------------------------------- |
| query parse, 7 fixtures    | `QueryString.parse`   |     443.46 | 2.25 Mops/s                       |
| query parse, 7 fixtures    | `URLSearchParams`     |     155.58 | 2.9× faster, **different work**   |
| cookie parse, 5 fixtures   | `parseCookieHeader`   |      1,302 | percent-decodes                   |
| cookie parse, 5 fixtures   | split + `fromEntries` |        278 | 4.7× faster, **no decoding**      |
| LRU get, 64 entries, hot   | `LRUCache.get`        |       96.5 | includes 4 Map operations per get |
| multi-value remove         | `MultiValueMap`       |       92.1 | raw Map: 60.5 ns (1.5× faster)    |
| multi-value add / get      | `MultiValueMap`       | ~22 / 15.7 | parity with raw Map               |
| ring buffer put, 16-slot   | `RingBuffer`          |        3.2 | circular array: 0.8 ns            |
| ring buffer get+put at cap | `RingBuffer`          |        7.2 | array push/shift: 12.9 ns         |
| ring buffer peek           | `RingBuffer`          |        1.7 | array `[0]`: 0.39 ns              |

The parser baselines are the most misleading results in the suite: the
query-string baseline constructs `URLSearchParams` and reads one key instead of
building a record, and the cookie baseline intentionally skips
percent-decoding. Neither can support a “slower/faster than X” claim.

### 3.4 ORM and property resolution

| Scenario                           |         Metric | Note                                     |
| :--------------------------------- | -------------: | :--------------------------------------- |
| `persist` update path, 1 entity    |     22.8 µs/op | 43.8k updates/s; RME 3.39%               |
| `persist` update path, 10 entities | 23.2 µs/entity | 232 ms per 10,000-persist batch          |
| `find` hit                         |      746 ns/op |                                          |
| `find` miss                        |      402 ns/op |                                          |
| `findAll`, 5 entities              |     2.25 µs/op | 450 ns per entity                        |
| `findAll`, 50 entities             |     18.9 µs/op | 379 ns per entity                        |
| `remove` on already-absent entity  |      760 ns/op | the bench removes the same entity 1,000× |
| property lookup, representative    |    18.35 ns/op | flat index                               |
| property lookup, representative    |    22.48 ns/op | prototype chain; flat is 18.4% faster    |
| property lookup, 1,000 keys        |      308 ns/op | **RME 6.29% — not trustworthy**          |

The ORM suite measures only the update path and a remove-miss path; insert,
remove-existing, criteria queries, and batch operations are unmeasured. The
22.8 µs update is the single largest per-operation cost in the estate and the
best candidate for a deep optimization pass.

### 3.5 `like`, errors, object merge

| Scenario                        | Implementation     |           ns/op | Note                               |
| :------------------------------ | :----------------- | --------------: | :--------------------------------- |
| `like` valid shape              | local `likeCached` |             9.2 | **not the shipped implementation** |
| `like` valid shape              | local `prekeys`    |             3.2 | exploration variant                |
| `like` rejects null             | production `like`  |            45.1 | curried call                       |
| `like` rejects mismatched type  | production `like`  |            56.6 | curried call                       |
| `FrameworkError`                | `new`              |         4.45 µs | RME 6.05%                          |
| `FrameworkError` with cause     | `new`              |         8.16 µs | 1.8× the no-cause cost             |
| object spread / `Object.assign` | —                  | ~0.07 / 0.09 µs | `Object.assign` 1.3× slower        |

`like.bench.ts` benchmarks a local `likeCached` function, not the production
`like` export. Its header still describes a Ramda-based implementation and
claims “43x faster fresh, 201x faster cached” — numbers with no artifact and no
current source. The only production `like` measurements are in the tiny
`test/benchmarks/bench.bench.ts`, which does not measure a valid-shape hit at
all.

---

## 4. Fairness and measurement defects

### D1 — The comparison row is a duplicate

`routing.bench.ts:70` and `:74` both create `RadixMetadataHandlerMapping`.
`bench('getHandler', …)` and `bench('RadixMetadataHandlerMapping', …)` run the
same code; the observed difference is 0.1–0.2%. The original linear baseline
was deleted with `LinearMetadataHandlerMapping`, but the scenario labels were
never updated.

### D2 — Different work per iteration

- `query-string.bench.ts:50` parses and enumerates keys; `:59` constructs
  `URLSearchParams` and reads one key.
- `cookie-parser.bench.ts:30` splits without decoding; `parseCookieHeader`
  percent-decodes.
- `argument-resolver.bench.ts` compares a predicate scan with a type-keyed
  `Map`; correct as an exploration, invalid as a drop-in claim.

### D3 — Setup inside the measured body

- `lru-cache.bench.ts:7-13` constructs the cache and warms 32 entries inside
  every iteration.
- `multi-value-map.bench.ts:54-70` rebuilds the “pre-filled” map inside the
  measured body; the get scenario therefore measures build + get.
- `path-matcher.bench.ts:25` constructs a new matcher inside the body, so the
  measured “cache hit” is only the second pass of a freshly built cache.
- `orm/entity-manager.bench.ts` state is module-level but the remove scenario
  (`:149`) removes an absent entity after the first call.

### D4 — No equivalence gate

No benchmark asserts that the candidate and baseline produce the same result.
That is how the parser and cookie comparisons drifted into different work
without anyone noticing. A `verify()` phase before timing would have caught
all of them.

### D5 — Units are batch throughput, not operation cost

Most scenarios wrap 1,000–16,000 logical operations in one iteration. Vitest
reports `hz` for the batch; the labels do not say “per 1,000” or “per
16,000”. The ORM table is especially easy to misread: 43.77 hz is not 44
operations per second, it is 43.8k updates/s.

### D6 — No environment fingerprint or artifact

The verbose reporter prints tables to stdout and nothing else. There is no
commit, Node version, OS, CPU, governor, file list, RME filter, or raw sample
data. A number in a README cannot be traced back to a run.

### D7 — Parallel files and the wrong environment

`vitest.config.ts:13` sets `environment: 'jsdom'` for every test and bench;
`fileParallelism` is not disabled. Pure Node microbenchmarks therefore run
under jsdom globals and compete with each other. The isolated LRU run
(1,242 hz) versus the full-lane run (1,035 hz) quantifies the distortion.

### D8 — Stale and duplicated benches

- `like.bench.ts` measures a local copy, not the shipped function.
- `test/benchmarks/bench.bench.ts` duplicates the `like` and error scenarios
  and lives outside the `bench/` convention.
- `dispatcher/bench/context-lookup.bench.ts` and
  `context/bench/context-lookup.bench.ts` overlap heavily.
- Comments in `routing.bench.ts` and `like.bench.ts` describe strategies and
  numbers that no longer exist.

### D9 — The browser lane cannot run

- `pnpm-workspace.yaml:5` and `package.json:15` point at
  `../todomvc/examples/ndigo`; that directory is absent.
- `scripts/benchmark-preview.mjs:110` runs
  `../todomvc/examples/ndigo/benchmark-runner.ts`; the existing runner is at
  `../todomvc/examples/bluejs/benchmark-runner.ts` (or the sibling root).
- `scripts/benchmark-preview.mjs` filters `@ndigo/todomvc`; the sibling
  package is `@blue/todomvc`.
- `scripts/benchmark-dom.ts:36-64` defines react/svelte/vue/vanilla only; there
  is no ndigo target and no `test:benchmark:ndigo` script.
- `packages/ndigo-view-webcomponent/README.md:83` says the suite “measures the
  engine against other frameworks”; today it cannot.

### D10 — Benchmarks are outside the typecheck lane

`tsconfig.spec.json:152` excludes `**/bench/**`. The files are typechecked by
neither `pnpm typecheck` nor CI, which is why stale imports and local copies
survive.

### D11 — No regression gate or baseline

Nothing compares a run to the previous run. `pnpm test:bench` exits 0 when a
scenario is 10× slower than yesterday; it only fails when a bench throws.

### D12 — Published claims are not derived from artifacts

The dispatcher README claim is the clearest case, but the pattern is general:
`docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md:83` cites a 40–63× radix-vs-
linear result whose benchmark no longer exists; the Ramda audit
(`docs/audits/2026-04-03_RAMDA_BENCHMARK_ANALYSIS.md`) benchmarks files that
were deleted in AD-84; guide 45 still describes the micro lane as
“`like()`/errors, spread.”

### D13 — Export-getter warnings

The run printed “accessed module export getters too many times” for
`cookie-parser`, `path-matcher`, `query-string`, and `routing`. Vitest warns
that this makes results unreliable; the affected benches import through
package barrels. Direct module imports or a pinned provider configuration are
required before publication.

### D14 — Poor RME is not filtered

`property-lookup` at 1,000 keys reported RME 6.29%; `FrameworkError` 6.05%;
ORM persist 3.39%. The lane accepts these silently. A publication threshold
(e.g. RME ≤ 2% for micro, ≤ 5% for macro) must reject them.

### D15 — Comparative claims lack provenance

The external versions of find-my-way and radix3 are in
`packages/ndigo-dispatcher/package.json` (`^9.10.0`, `^1.1.2`), but the
benchmark and any future results doc do not record the resolved versions. A
minor bump can change the comparison.

---

## 5. What the current data says about optimization priorities

These are hypotheses to validate with the refreshed harness, not conclusions.

| Priority | Lead                                                                          | Evidence                                                          | Candidate change                                                                                                             | Success signal                   |
| :------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------- |
| P0       | Full handler resolution is 4.6–23.5× slower than raw routers on hit scenarios | 525–710 ns/op versus 22–153 ns/op                                 | Fast path for one candidate with no conditions; avoid `Reflect.defineProperty`; avoid the filter array; cache the comparator | ≥2× reduction on static/param    |
| P1       | Resolver selection scans the resolver list per parameter                      | `Array.find` 48–140 ns vs `Map` 5–6 ns; 3-param invoke 473 ns     | Cache the resolved resolver per `MethodParameter` (verify the documented cache actually exists)                              | 3-param invoke < 350 ns          |
| P1       | ORM update-persist is 22.8 µs/op                                              | 43.8k updates/s; insert path unmeasured                           | Cache schema validators/metadata; skip redundant re-derivation; fast path for unchanged fields                               | update < 5 µs/op                 |
| P2       | `getValue('entry5')` is 2.5× slower than `entry1`                             | 16.85 vs 6.72 ns/op                                               | Normalize instance storage (separate `Map`) or investigate property-shape transitions                                        | all entries within 20%           |
| P2       | LRU `get` performs four Map operations                                        | 96.5 ns/op; `Map.get` baseline far cheaper                        | Single `get`; sentinel for stored `undefined`; compare with `lru-cache` npm                                                  | get < 50 ns/op                   |
| P3       | Cookie parser is 4.7× slower than an undecoded split                          | 1.3 µs vs 278 ns; no equivalent baseline                          | Fast path when `%` is absent; fewer regex passes                                                                             | within 2× of decoded baseline    |
| P3       | Query parser is 2.9× slower than a partial URLSearchParams path               | 443 ns vs 156 ns; different work                                  | Equivalent adapter first, then profile                                                                                       | within 2× of equivalent baseline |
| P3       | Production `like` curried call is 45–57 ns                                    | local cached variant 9 ns; valid-shape production path unmeasured | Measure valid-shape production path; remove avoidable wrapper work                                                           | < 20 ns/op                       |
| P4       | Error construction is 4.45 µs (8.16 µs with cause)                            | Stack capture dominates; no native `Error` baseline               | Decide whether stack capture is required on every construction; compare native                                               | documented trade-off             |
| P4       | Path-matcher cache benefit is only 7%                                         | Matcher constructed per iteration                                 | Re-measure steady-state hit/miss; then decide whether the cache earns its keep                                               | measured, not guessed            |

Do **not** start with the parser or LRU micro-optimizations: the dispatcher and
ORM leads are an order of magnitude larger and sit directly on the request
path.

---

## 6. Coverage gaps

Ranked by user-visible impact and framework differentiation:

1. **End-to-end HTTP request path** — no benchmark measures Ndigo versus
   Fastify/Express/Hono over a real socket with identical routes, payloads,
   production builds, and a load generator. This is the single largest missing
   piece; microbenchmarks cannot answer “is the framework fast?”
2. **Dispatcher parity and scale** — no like-for-like router comparison (raw
   lookup + params extraction), no condition/method/wildcard/405 scenarios, no
   100/1,000-route scale in the dispatcher.
3. **Argument binding breadth** — body, header, cookie, multipart, validation,
   and 10-parameter handlers are unmeasured; only path/query/attribute are
   covered.
4. **HTTP parsers** — query-string serialization, `Set-Cookie`, content-type,
   authorization headers, and matrix strings are unmeasured; the one parser
   bench that exists is not equivalent.
5. **ORM full lifecycle** — insert, remove-existing, criteria queries, batch,
   identity map, and 10k-row scans are missing.
6. **Browser/DOM** — the only comparative lane that could show a framework
   advantage is broken; SSR/island rendering is unmeasured.
7. **Startup, memory, and scale-out** — cold time-to-listen, RSS, 100/1,000
   routes, 10/100/1,000 entries, and 1/2/4 cluster slots are unmeasured.
8. **Signals and view** — the signals package is a re-export of
   `@preact/signals-core`; only the decorator/event-bridge wrapper is
   Ndigo-specific and unmeasured. Claiming an engine win would be dishonest.
9. **Operational components** — cache, resilience, rate-limit, locks, log,
   telemetry, flags, socket fan-out, and serialization have no benchmarks.

---

## 7. What “documented” must mean

A benchmark result is publishable only when all of the following are attached:

1. The benchmark file and scenario name.
2. The commit hash and date.
3. Node, pnpm, OS/kernel, CPU model, core count, governor, and whether the host
   was otherwise idle.
4. The exact comparator and resolved version.
5. The logical unit and the ops-per-iteration divisor.
6. Median, p99, RME, sample count, and the number of independent runs.
7. The semantic-equivalence check that passed before timing.
8. A raw JSON artifact, committed or linked, from which the table was derived.
9. A statement of what the number does **not** prove.

A claim must be retracted or re-measured when the benchmark, the comparator,
the Node major, or the hardware class changes. “Faster” means a ratio whose
confidence interval excludes 1.0 and exceeds the declared noise floor — not a
single run’s best sample.

---

## 8. Bottom line

The estate has good raw material: the containers, radix tree, property lookup,
and dispatcher microbenches are worth keeping. It lacks the three things that
make benchmarks useful: **semantic parity**, **reproducibility**, and
**publication discipline**. The current data already points to four
high-value optimization targets (dispatcher resolution, resolver selection,
ORM persist, and entry lookup). Fix the harness first; then use it to drive
those changes; then publish only what the artifacts support.

---

## 9. Refresh status (2026-11-10)

Phase 0 and Phase 1 of the refresh plan landed in commit `b21c9f28d`. The
snapshot in §3 remains the **before** record; the current serial baseline is
`benchmarks/baselines/reference.json` and the user-facing results are in
[`BENCHMARKS.md`](../../BENCHMARKS.md).

| Defect                          | Resolution                                                                                                                                            |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 duplicate comparison row     | Removed; routing now separates verified parity from full resolution.                                                                                  |
| D2 different work per iteration | Query-string and cookie rows now build the same records; `cookie` is compared only where key decoding matches.                                        |
| D3 setup inside the body        | Fixtures moved to module scope or `beforeEach`; per-op units via `@ops=N`.                                                                            |
| D4 no equivalence gate          | Every comparator calls `assertEquivalent` before timing.                                                                                              |
| D5 batch units                  | `ns/op`/`ops/s` derived from `opsPerIteration`; runner normalizes.                                                                                    |
| D6 no artifact/fingerprint      | `scripts/bench-run.mjs` writes JSON with commit, dirty flag, Node, pnpm, OS, CPU, governor, load, and per-scenario statistics.                        |
| D7 parallel + jsdom             | `vitest.bench.config.ts` uses the Node environment, one worker, no file parallelism, no shuffle.                                                      |
| D8 stale/duplicate benches      | `like` exploration replaced with the production export; duplicate micro-suite removed; dispatcher factory bench renamed.                              |
| D9 browser lane                 | React/vanilla jsdom targets work; Svelte/Vue/Ndigo fail fast with an explicit quarantine reason.                                                      |
| D10 typecheck gap               | `packages/*/bench/**` and `benchmarks/**` are in `tsconfig.spec.json`; `pnpm lint` passes.                                                            |
| D11 no baseline gate            | `scripts/bench-compare.mjs` fails on >10% median regressions when RME ≤ 2%.                                                                           |
| D12 unsupported claims          | Dispatcher and view claims corrected; Ramda audit marked historical; guide 45 and root README link to `BENCHMARKS.md`.                                |
| D13 export-getter warnings      | Benchmark files import concrete modules; remaining warnings come from framework-internal barrel imports and are documented in `benchmarks/README.md`. |
| D14 poor RME accepted           | Runner rejects comparisons above 2% RME; long-running scenarios use explicit time/warmup options.                                                     |
| D15 comparator provenance       | `lru-cache`, `qs`, and `cookie` are pinned devDependencies; router versions were already pinned in the dispatcher manifest.                           |

**Still open:** a keep-alive/production-build variant of the macro HTTP lane,
the real-browser DOM runner, and the telemetry row (deferred as low-signal:
ndigo wraps the OTel API). The serialization row was dropped as not
measurable (TOON is a config-file-only peer seam). Landed: cache, flags,
signals (incl. `@effect`), rate-limit, locks, log-disabled dispatch, socket
STOMP codec, resilience woven interceptors, and view JSON/CSV serializing
views. Phase 4 is otherwise complete. The nightly non-gating CI lane is
added (`.github/workflows/benchmarks.yml`).
