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

The first clean serial baseline is
[`benchmarks/baselines/reference.json`](benchmarks/baselines/reference.json)
(run artifact `2026-11-11T00-45-08-a52fcab49840.json`, commit `a52fcab49`,
`dirty: false`, 133 scenarios, 244 s). All values are `ns/op` (lower is
better); ratios are calculated from the same artifact.

### Routing parity — same work

`RadixTree.lookup` and the two external routers all look up a path and extract
the same `:params`. These rows are like-for-like.

| Scenario            | RadixTree | find-my-way | radix3 |
| :------------------ | --------: | ----------: | -----: |
| static `/users`     |     54.57 |       52.61 |  31.45 |
| param `/users/42`   |    133.57 |      173.49 | 179.31 |
| deep 4-segment      |    216.91 |      214.52 | 181.10 |
| miss `/nonexistent` |     44.25 |       20.37 |  48.82 |

RadixTree is 1.3× faster than find-my-way and radix3 on the parameterized
route, effectively tied on the deep route, and slower on the static route and
route miss. It does not support a general “faster than popular routers” claim.

### Routing — full handler resolution

`RadixMetadataHandlerMapping.getHandler` adds candidate filtering, route
conditions, mapping selection, and `route.pattern` decoration. It has no
external comparator because the other routers do not implement those
semantics.

| Scenario             | `getHandler` | Raw `RadixTree.lookup` |
| :------------------- | -----------: | ---------------------: |
| static `/users`      |       329.45 |                  54.57 |
| param `/users/42`    |       356.44 |                 133.57 |
| deep 4-segment       |       440.32 |                 216.91 |
| miss `/nonexistent`  |        51.26 |                  44.25 |
| three-route rotation |       405.91 |                      — |

Full resolution costs roughly 2–6× the raw lookup, which is the price of the
framework semantics. This is the number to optimize, not the external-router
ratio.

### Containers and parsers

| Scenario                   |   Ndigo | Comparator                       |                              Ratio |
| :------------------------- | ------: | :------------------------------- | ---------------------------------: |
| LRU `get` hit              |   49.05 | `lru-cache` 30.57                |                       1.60× slower |
| LRU `set` existing         |   24.07 | `lru-cache` 17.39                |                       1.38× slower |
| LRU `set` eviction         |  107.08 | `lru-cache` 101.47               |                  parity (RME > 2%) |
| MultiValueMap `add`        |   13.91 | raw `Map` 13.75                  |                       1.01× slower |
| MultiValueMap `get`        |    6.11 | raw `Map` 6.11                   |                             parity |
| MultiValueMap `remove`     |   15.02 | raw `Map` 15.41                  |                       1.03× faster |
| RingBuffer FIFO put+get    |    4.86 | `Array` push/shift 22.65         |                       4.66× faster |
| RingBuffer bounded queue   |    4.54 | `Array` push/shift 7.65          |                       1.69× faster |
| RingBuffer `peek`          |    1.26 | `Array[0]` 0.43                  |                       2.93× slower |
| RingBuffer burst put       |    2.65 | circular array 0.29              |     9.1× slower (plain assignment) |
| Path matcher, warm cache   |   45.87 | compile RegExp 371.52            |                        8.1× faster |
| Path matcher, new instance |  133.75 | compile RegExp 372.89            |                        2.8× faster |
| Query parse                |  208.83 | `URLSearchParams` adapter 172.43 |                       1.21× slower |
| Query parse                |  208.83 | `qs` 1026.28                     |                        4.9× faster |
| Query stringify            | 1248.75 | `qs` 1576.51                     |                       1.26× faster |
| Cookie parse               |  817.22 | split+decode 240.18              |                       3.40× slower |
| Cookie parse               |  817.22 | `cookie` (values only) 123.91    | 6.6× slower, different fixture set |

The cookie parser and LRU `get` are the clearest commodity-level optimization
targets. The ring buffer and path-matcher cache are clear wins within their
intended workloads.

The first optimization from this harness landed in `@ndigo/core`: `LRUCache.get`
and `set` now perform one `Map` lookup instead of two on the hit path
(`get` 56.93 → 49.05 ns, `set` 29.48 → 24.07 ns on the reference host). The
remaining gap to `lru-cache` is the recency `delete` + re-insert, not the
presence check.

### Property index, context, bindings, and ORM

| Scenario                                           |                                     Ndigo | Comparator       |                              Ratio |
| :------------------------------------------------- | ----------------------------------------: | :--------------- | ---------------------------------: |
| Property index, representative                     |                                     26.21 | prototype 56.08  |                       2.14× faster |
| Property index, 32 sources                         |                                     11.54 | prototype 30.64  |                       2.65× faster |
| Property index, access mix                         |                                     11.87 | prototype 21.09  |                       1.78× faster |
| Property index, 1,000 keys                         |                                    646.89 | prototype 656.03 |                  parity (RME > 5%) |
| `getValue` bean1 / bean5                           |                             13.74 / 12.65 | —                |                           absolute |
| `getValue` via token                               |                                     13.53 | string 13.74     |                             parity |
| `hasValue` hit / miss                              |                              4.03 / 17.77 | —                |                           absolute |
| Dynamic context, 1 / 1,000 values                  |                             12.46 / 16.36 | —                |                           absolute |
| Dynamic context, 10 / 100 values                   |                             28.85 / 28.69 | —                | shape-sensitive; not an O(1) claim |
| Factory `getValue` warm / miss                     |                              3.56 / 18.69 | —                |                           absolute |
| Resolver lookup path                               |                                     28.43 | `Map.get` 4.02   |                        7.1× slower |
| Resolver lookup query                              |                                     82.29 | `Map.get` 2.78   |                       29.6× slower |
| `invoke` 0 / 1 path / 1 query / 3 mixed / 10 query | 95.22 / 163.81 / 162.38 / 327.08 / 853.15 | —                |                           absolute |
| ORM persist insert / update                        |                       15.25 µs / 14.56 µs | —                |               RME > 2%; indicative |
| ORM `find` hit / miss                              |                           384.91 / 210.47 | `Map.get` 2.35   |                     absolute/floor |
| ORM `findAll` 1,000 / 10,000 rows                  |                       186.39 µs / 1.85 ms | —                |                           absolute |
| ORM `remove` existing                              |                                    946.58 | —                |               RME > 2%; indicative |

The flat merged property index clears the AD-11 decision rule on the
representative and high-overlap workloads. ORM writes remain the largest
per-operation cost in the estate and the best candidate for the next deep
optimization pass.

### `like` and error construction

| Scenario                              |              Ndigo | Comparator                      |
| :------------------------------------ | -----------------: | :------------------------------ |
| `like` cached valid / null / mismatch | 2.17 / 0.29 / 1.96 | hand-written `typeof` 0.27      |
| `like` two-arg valid / null           |      24.07 / 22.47 | —                               |
| `like` fresh descriptor               |    394.08 / 388.04 | RME > 13%; inconclusive         |
| `FrameworkError`                      |            2519.87 | native `Error` 2498.78 (+0.8%)  |
| `FrameworkError` with cause           |            2896.30 | native `Error` 2566.04 (+12.9%) |

Scenarios above 2% RME are marked inconclusive and excluded from headline
claims; they remain in the artifact and the baseline comparator skips them.

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
