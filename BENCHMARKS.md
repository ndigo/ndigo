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
(run artifact `2026-11-11T01-03-43-b8cc6b3788f0.json`, commit `b8cc6b37`,
`dirty: false`, 133 scenarios, 247 s). All values are `ns/op` (lower is
better); ratios use the same artifact. Absolute numbers move with host state;
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

### Containers and parsers

| Scenario                   |   Ndigo | Comparator                       |                              Ratio |
| :------------------------- | ------: | :------------------------------- | ---------------------------------: |
| LRU `get` hit              |   55.78 | `lru-cache` 32.13                |                       1.74× slower |
| LRU `set` existing         |   25.29 | `lru-cache` 18.87                |                       1.34× slower |
| LRU `set` eviction         |  104.46 | `lru-cache` 105.97               |       parity (comparator RME > 2%) |
| MultiValueMap `add`        |   13.74 | raw `Map` 13.34                  |                       1.03× slower |
| MultiValueMap `get`        |    5.58 | raw `Map` 5.60                   |                             parity |
| MultiValueMap `remove`     |   13.60 | raw `Map` 14.24                  |                       1.05× faster |
| RingBuffer FIFO put+get    |    4.99 | `Array` push/shift 23.71         |                       4.75× faster |
| RingBuffer bounded queue   |    4.52 | `Array` push/shift 8.20          |                       1.81× faster |
| RingBuffer `peek`          |    1.28 | `Array[0]` 0.43                  |                        3.0× slower |
| RingBuffer burst put       |    2.78 | circular array 0.29              |     9.6× slower (plain assignment) |
| Path matcher, warm cache   |   43.01 | compile RegExp 364.17            |                       8.47× faster |
| Path matcher, new instance |  130.90 | compile RegExp 375.92            |                       2.87× faster |
| Query parse                |  237.55 | `URLSearchParams` adapter 180.88 |                       1.31× slower |
| Query parse                |  237.55 | `qs` 1188.46                     |                       5.00× faster |
| Query stringify            | 1348.34 | `qs` 1578.10                     |                       1.17× faster |
| Cookie parse               |  825.63 | split+decode 253.60              |                       3.26× slower |
| Cookie parse               |  825.63 | `cookie` (values only) 125.47    | 6.6× slower, different fixture set |

The cookie parser and LRU `get` remain the clearest commodity-level
optimization targets. The ring buffer and path-matcher cache are clear wins
within their intended workloads.

`LRUCache.get`/`set` already include the first optimization from this harness:
one `Map` lookup instead of two on the hit path. Relative to the same-run
`lru-cache` comparator, `get` improved from 1.90× to 1.74× slower and `set`
from 1.66× to 1.34× slower between the first and final clean baselines. The
absolute values moved with host state; the ratio is the honest signal. The
remaining gap is the recency `delete` + re-insert, not the presence check.

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
representative, 32-source, and access-mix workloads. ORM writes remain the
largest per-operation cost in the estate and the best candidate for the next
deep optimization pass.

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

Valid binding is cheap; the **invalid path costs ~200× the valid path**
because `safeParse` allocates the full issue list and throws a framework
error. Request-rejection traffic pays that cost per request.

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
