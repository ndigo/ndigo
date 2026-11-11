# Benchmark Refresh and Expansion Plan — 2026-11-10

**Status:** In progress — Phase 0 and Phase 1 are implemented on this branch;
Phase 2+ remains.
**Input:** [Benchmark Estate Audit](../audits/2026-11-10_BENCHMARK_ESTATE_AUDIT.md)
**Goal:** a benchmark estate that is reproducible, semantically fair, and
useful as an optimization driver — and a documentation surface that can
support honest public performance claims.

---

## Implementation progress (2026-11-10)

- **Phase 0 — done:** serial `vitest.bench.config.ts`; `bench-run`,
  `bench-compare`, and `bench-report` scripts; JSON artifacts with environment
  fingerprint; benchmark files included in the spec typecheck lane; duplicates
  removed; the dispatcher and view claims corrected; jsdom targets that cannot
  execute module bundles quarantined with an explicit failure.
- **Phase 1 — done:** every committed benchmark refreshed or replaced;
  `@ops=N` units; `assertEquivalent` gates; external comparators for LRU,
  query-string, cookies, and routers; production `like` regression (the local
  exploration was deleted); ORM insert/update/find/findAll lifecycle.
- **Phase 2 — partial:** router parity vs find-my-way/radix3 is separated from
  full handler resolution and verified. End-to-end HTTP, binding/validation,
  startup/RSS, and the `benchmarks/` macro workspace remain.
- **Phase 3 — quarantined:** the jsdom DOM harness works for React and vanilla
  only; Svelte/Vue/Ndigo use module scripts that jsdom cannot execute.
- **Phases 4–5 — pending.**


---

## 1. Decision

Rebuild the benchmark lane around three invariants before adding new
benchmarks:

1. **Semantic parity** — every comparison proves that both sides produce the
   same result on the fixture set before a single sample is timed.
2. **Reproducibility** — one command runs benchmarks serially, records the
   commit, Node/pnpm/OS/CPU fingerprint, and writes a machine-readable
   artifact from which every published number is derived.
3. **Publication discipline** — no “X× faster” claim without an artifact,
   an environment, a date, a comparator version, and a statement of what the
   number does not prove. Losses are published alongside wins.

The existing suite is not thrown away. The containers, radix tree, property
lookup, dispatcher, and parser benches are retained and repaired; the local
`like` exploration and the duplicate micro-suite are replaced.

**Non-goals:**

- No competitor tuning, no strawman baselines, no “best of N” reporting.
- No PR-level performance gate on noisy shared hardware. Benchmarks run
  nightly/weekly and on demand; correctness gates stay in the normal CI lane.
- No claim that a re-exported engine (`@ndigo/signals` → `@preact/signals-core`)
  is faster than that engine.
- No public absolute numbers compared across different hardware.

---

## 2. Fairness contract (normative)

Every benchmark PR must satisfy all eight rules. Reviewers can reject a
benchmark that violates any of them.

| #   | Rule                  | Requirement                                                                                                                                                            |
| --- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Semantic parity       | A `verify` step runs once before timing and asserts equivalent output (params, records, state, DOM, or response body). A mismatch fails the bench.                     |
| 2   | Work parity           | Both sides perform the same logical operations on the same inputs. Setup, fixture construction, and warmup live outside the measured body unless setup is the subject. |
| 3   | Unit parity           | Report `ns/op` or `ops/s` for one logical operation. If an iteration contains N operations, record `opsPerIteration: N` and divide. `hz` alone is not a unit.          |
| 4   | Environment parity    | Same process, same Node flags, same machine, serial execution, no other load, production mode for macro benchmarks.                                                    |
| 5   | Statistical rigor     | Median is the primary statistic; report p99, RME, sample count, and ≥5 independent process runs for comparative claims. Reject micro RME > 2%.                         |
| 6   | Comparator provenance | Pin and record the comparator version. Document any semantic difference and, when the difference is material, present the row as a “floor,” not an alternative.        |
| 7   | Publication honesty   | A claim cites the benchmark file, commit, date, environment, artifact, unit, ratio with uncertainty, and the scenarios where ndigo loses.                              |
| 8   | Expiry                | A claim is re-measured when its benchmark, comparator, Node major, or hardware class changes; otherwise it expires after 90 days.                                      |

The comparison rules in one sentence: **same result, same work, same unit,
same environment, enough samples, and the raw artifact survives.**

---

## 3. Phase 0 — Integrity baseline

**Exit criterion:** `pnpm test:bench` is serial, typechecked, fingerprinted,
and writes a JSON artifact; no unsubstantiated public claim remains.

### 0.1 Serialize the lane and fix the environment

- Add `vitest.bench.config.ts`:
    - `environment: 'node'` (DOM files opt in with
      `// @vitest-environment jsdom`);
    - `fileParallelism: false`, `maxWorkers: 1`, `sequence.shuffle: false`;
    - `benchmark.include: ['packages/*/bench/**/*.bench.ts', 'benchmarks/**/*.bench.ts']`;
    - reuse `ndigoAliases` and `lowerDecorators()`.
- Run one benchmark file per child process in the runner (below). This avoids
  cross-file JIT/GC pollution and makes a failed file attributable.
- Re-run the current suite on the reference host and record the new baseline.
  The old snapshot in the audit is indicative only.

### 0.2 Add a runner, artifact schema, and comparison command

Add `scripts/bench-run.mjs`, `scripts/bench-compare.mjs`, and
`scripts/bench-report.mjs` (Node, no new framework dependency):

```text
benchmarks/
  baselines/reference-<cpu-class>.json
  results/<ISO-date>-<commit>.json
  lib/verify.ts
  README.md
```

`bench-run.mjs`:

1. Discovers `*.bench.ts` files (exclude `node_modules`, `lib`, `dist`).
2. Runs each file with `vitest bench --run --config vitest.bench.config.ts`
   and `--reporter=json --outputFile=<tmp>`; the JSON reporter already emits
   `latency` and `throughput` statistics per task.
3. Merges results with metadata:
   `{ commit, dirty, date, node, pnpm, os, kernel, cpu, cores, governor,
   loadAverage, files, scenarios }`.
4. Each scenario records `file`, `suite`, `name`, `unit`, `opsPerIteration`,
   `latency`, `throughput`, `rank`, `comparatorVersion`, `equivalence`.
5. Fails on any bench error, missing result, RME above the threshold, or
   missing `equivalence: true`.
6. Supports `--quick` (one run, no baseline check) and `--update-baseline`.

`bench-compare.mjs`:

- Matches scenarios by `file + suite + name`.
- Compares median latency to the baseline for the same CPU class.
- Fails on a regression > 10% when both runs have RME ≤ 2% (micro) or ≤ 5%
  (macro); warns on 5–10%; ignores differences inside the noise floor.
- Reports added/removed/renamed scenarios explicitly so a renamed bench does
  not silently disappear.

`bench-report.mjs` generates the Markdown tables for `BENCHMARKS.md`; the
published doc is still hand-reviewed, but no number is typed by hand.

### 0.3 Typecheck and lint the benchmarks

- Remove `**/bench/**` from `tsconfig.spec.json:152`, or add
  `tsconfig.bench.json` that includes `packages/*/bench/**/*.ts`,
  `benchmarks/**/*.ts`, and the runner scripts; add it to `pnpm typecheck`.
- Fix imports exposed by the lane: benchmark files import concrete modules,
  not package barrels, to eliminate the “module export getters too many times”
  warnings (`cookie-parser`, `path-matcher`, `query-string`, `routing`).
- Ensure `pnpm lint`, `knip`, and `manifest:check` accept the new
  `benchmarks/` package and its devDependencies.

### 0.4 Quarantine or correct every claim

- `packages/ndigo-dispatcher/README.md:46` — remove the “3–6x faster than
  popular router libraries” sentence. Replace it with a neutral pointer to
  `BENCHMARKS.md`; restore a numeric claim only after Phase 2 produces a
  like-for-like artifact.
- `packages/ndigo-view-webcomponent/README.md:83` — mark the browser claim as
  unverified until Phase 3 restores the lane.
- `docs/guides/45-performance-and-scaling.md:30,155` — replace the stale
  “e.g. `like()`/errors” description with the real lane names and link to
  `BENCHMARKS.md`.
- `docs/audits/2026-04-03_RAMDA_BENCHMARK_ANALYSIS.md` — already historical;
  add a one-line header that its benchmark files were deleted in AD-84, so the
  numbers are not treated as current.
- `docs/audits/2026-09-05_FRAMEWORK_ASSESSMENT.md:83` — annotate that the
  40–63× result compared radix with the deleted linear mapping, not external
  routers.

### 0.5 Browser lane triage

Either fix the sibling paths (`../todomvc/examples/ndigo` → `bluejs`, package
`@ndigo/todomvc` → `@blue/todomvc`) or make every `test:benchmark*` command
fail immediately with a clear “lane unavailable — see BENCHMARKS.md” message.
Do not leave a command that silently produces nothing.

---

## 4. Phase 1 — Refresh the existing micro suite

Repair before expanding. Each row is a separate change with its own
before/after artifact.

| File                                                         | Action           | Required changes                                                                                                                                                                                                                                                                                                                                                              |
| :----------------------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ndigo-core/bench/lru-cache.bench.ts`               | Refresh          | Move construction/warmup to `setup`; measure `get` hit/miss, `set` hit/evict, 64/1,024 capacity; add `lru-cache` npm comparison with TTL disabled; record opsPerIteration; verify stored values and eviction order.                                                                                                                                                           |
| `packages/ndigo-core/bench/multi-value-map.bench.ts`         | Refresh          | Pre-fill outside the body; measure `add`, `get`, `remove`, `delete key`, 10/1,000 keys; verify final map contents; raw `Map<K, V[]>` baseline stays.                                                                                                                                                                                                                          |
| `packages/ndigo-core/bench/ring-buffer.bench.ts`             | Keep             | Add wrap-around, full/empty, drain, and overwrite-at-capacity cases; reset state in `setup`; keep the `Array` baseline; verify FIFO order.                                                                                                                                                                                                                                    |
| `packages/ndigo-core/bench/path-matcher.bench.ts`            | Refresh          | Separate cold compile from steady-state hit on a shared matcher; measure miss and invalidation; verify match results; report cache-hit ratio.                                                                                                                                                                                                                                 |
| `packages/ndigo-core/bench/radix-tree.bench.ts`              | Keep + expand    | Add 1,000-route scale, wildcard/greedy, param precedence, method-independent lookups; verify params; keep internal Map/RegExp baselines and cross-link the dispatcher comparison for external routers.                                                                                                                                                                        |
| `packages/ndigo-core/bench/like.bench.ts`                    | **Replace**      | Delete the 841-line local-implementation exploration. Add a short regression bench that imports the production `like`, measures valid hit (cached descriptor), valid hit (fresh descriptor), null, and mismatch; compare with a hand-written shape check as a floor; assert identical booleans.                                                                               |
| `packages/ndigo-core/test/benchmarks/bench.bench.ts`         | Move + refresh   | Move to `packages/ndigo-core/bench/error.bench.ts`; keep `FrameworkError` vs native `Error`, with/without cause; drop the duplicated `like` and object-merge rows (covered elsewhere).                                                                                                                                                                                        |
| `packages/ndigo-context/bench/context-lookup.bench.ts`       | Refresh          | Add 1/10/100/1,000 beans, string vs `ContextToken`, hit/miss/`hasValue`/`keys`, child context, and refresh cost; raw `Map` floor; verify returned instance identity.                                                                                                                                                                                                          |
| `packages/ndigo-context/bench/property-lookup.bench.ts`      | Keep             | Preserve the committed protocol and decision rule. Add ≥5 independent runs, RME filtering, and the actual Node default proof; leave browser claims out (V8-only).                                                                                                                                                                                                             |
| `packages/ndigo-dispatcher/bench/routing.bench.ts`           | Refresh + fix    | Remove the duplicate `getHandler` / `RadixMetadataHandlerMapping` row (or restore a real second strategy); split **parity mode** (lookup + params, no conditions) from **full resolution** (conditions + pattern decoration); add static/param/deep/wildcard/miss/method-mismatch and 3/20/100/1,000 routes; verify `{handlerId, params, pattern}`; record resolver versions. |
| `packages/ndigo-dispatcher/bench/argument-resolver.bench.ts` | Refresh          | Relabel `Map.get` as a hypothetical selector, not a drop-in; add 0/1/3/10 params and path/query/header/cookie/body resolvers; measure the resolver cache if it exists; verify extracted values; hand-written extraction floor.                                                                                                                                                |
| `packages/ndigo-dispatcher/bench/context-lookup.bench.ts`    | Consolidate      | Merge into the context package bench (or keep one and cross-link); avoid two sources of truth for the same `getValue` path.                                                                                                                                                                                                                                                   |
| `packages/ndigo-http/bench/query-string.bench.ts`            | Refresh + fix    | Add a `URLSearchParams` adapter that builds the same record, plus `qs` with equivalent options; separate parse and stringify; 1/10/100 pairs, repeated keys, `+`, invalid escapes; deep-equal verify; record size distribution.                                                                                                                                               |
| `packages/ndigo-platform-web/bench/cookie-parser.bench.ts`   | Refresh + fix    | Add a decoding `split` baseline and the `cookie` npm package; add `Set-Cookie` serialization; verify decoded records; keep the undecoded row only as an explicitly labelled floor.                                                                                                                                                                                            |
| `packages/ndigo-orm/bench/entity-manager.bench.ts`           | Refresh + expand | Add insert (new entity), update (existing), remove-existing then re-add, find/findAll at 1/100/10,000 rows, criteria/filter, and batch persist; stop measuring remove-miss as “remove”; add a plain `Map` CRUD floor; verify store state after each scenario.                                                                                                                 |

**Definition of done for Phase 1:** every retained bench has a unit, a
`verify` step, a comparator or an explicit “absolute only” marker, and a JSON
artifact. The full suite runs serially in under 10 minutes on the reference
host.

---

## 5. Phase 2 — Request-path benchmarks

This is where framework-level claims become possible.

### 2.1 Router parity and full-resolution benchmarks

Add `benchmarks/router/` with two modes:

- **Parity:** `RadixTree.lookup` (and a thin mapping wrapper that only
  extracts params) vs find-my-way, radix3, Express 5's router, and Hono's
  `RegExpRouter`. One handler per route, no conditions, no framework
  decoration.
- **Full resolution:** `RadixMetadataHandlerMapping.getHandler` with the
  conditions, candidate filtering, and pattern decoration that real requests
  pay.

Scenarios: static, one param, deep four-segment, two params, wildcard,
trailing slash, 404, method mismatch, and 3/20/100/1,000 routes. Verify the
same `{handlerId, params}` on every case. Report both modes; never mix them in
one ratio.

### 2.2 Binding and validation benchmarks

`benchmarks/dispatcher/binding.bench.ts`:

- 0, 1, 3, and 10 parameters; path/query/header/cookie/body sources.
- JSON bodies at 1 KB, 10 KB, and 100 KB; valid and invalid (Zod) payloads.
- `@parameters` declarative binding vs hand-written extraction (floor).
- Fastify schema validation as a separate, clearly labelled row — it is not
  semantically identical to Zod validation.

Verify the handler receives the same typed arguments in every row.

### 2.3 End-to-end HTTP benchmarks

Create a private `benchmarks/` workspace package with only devDependencies
(`autocannon`, `fastify`, `express`, `hono`, `cookie`, `qs`, `lru-cache`) so
competitor libraries never enter a published package's dependency graph.

Apps: `benchmarks/http/{ndigo,fastify,express,hono}` with identical routes:

- `GET /json` — small object response.
- `GET /users/:id` — path parameter.
- `POST /echo` — 1 KB JSON body, echoed.
- `GET /chain` — three interceptors/middleware then a handler.
- `GET /missing` — 404.

Protocol:

- Production build; `NODE_ENV=production`; cluster size 1; HTTP/1.1 only.
- Same Node binary and flags; logging and telemetry disabled.
- autocannon: fixed connections and duration (e.g. 100 connections, 30 s),
  warmup run discarded, 5 measured runs, randomized app order.
- Report requests/s, p50/p99 latency, non-2xx count, and RSS after the run.
- Verify response bodies once before measuring.
- Publish the exact commands and versions.

### 2.4 Startup, memory, and scale-out

- Cold time-to-listen: spawn the production build, measure until the socket
  accepts, 10 runs, median and p95.
- RSS after 1,000 requests (same load generator).
- Route/bean scale: 100 and 1,000 routes; 10 and 100 beans; cold start and
  first-request cost.
- Cluster slots: 1/2/4 slots, RPS and p99; document that in-process caches
  multiply with slots.

### 2.5 Negative paths

404, 405, validation failure, auth denial, and rate-limit rejection. These are
often a larger share of real traffic than the happy path and exercise
different code.

---

## 6. Phase 3 — Browser and DOM lane

The current lane cannot produce a number. Rebuild it around one harness.

1. **Own the harness.** Vendor the Speedometer-3-style runner into
   `benchmarks/dom/` and keep the TodoMVC example apps as external fixtures
   addressed by `BENCHMARK_TODOMVC_DIR`, or pin the sibling repository to a
   commit. A published browser claim must be reproducible from this repository
   plus a pinned fixture.
2. **Fix the fixtures.** Rename or explicitly target the legacy `bluejs`
   example as the Ndigo app; update `pnpm-workspace.yaml:5`,
   `package.json:9,15`, and the preview script filter/package name.
3. **Add the ndigo target** to the DOM harness and a `test:benchmark:ndigo`
   script. The target loads a production bundle, not a dev server.
4. **Real browser only for published numbers.** Playwright Chromium, pinned
   version, same machine, 5 runs, randomized order. Keep the jsdom harness
   only as a fast smoke checker and label it “jsdom approximation — no layout
   or paint.”
5. **Verify DOM equivalence** after each workload step (item counts, text,
   class state) before timing.
6. **Publish sync and async phases separately**; include bundle size (raw and
   gzip) and build time, not just interaction time.
7. **Add SSR/island benchmarks** separately: render-to-string for the EJS,
   TOON, and webcomponent paths; island model serialization and hydration
   cost. Do not mix SSR CPU cost with browser interaction time.

---

## 7. Phase 4 — Coverage expansion

Only after Phases 0–2 are trustworthy. Ordered by differentiation:

| Area          | Benchmark                                         | Comparator / baseline                  | Notes                                                         |
| :------------ | :------------------------------------------------ | :------------------------------------- | :------------------------------------------------------------ |
| Cache         | LRU hit/miss/evict, TTL expiry, memory footprint  | `lru-cache` npm (TTL off), plain `Map` | Same capacity and key distribution.                           |
| Resilience    | Retry/backoff, circuit breaker, timeout           | hand-written baseline                  | Absolute + per-attempt cost.                                  |
| Rate limit    | Fixed window, sliding window, token bucket        | hand-written baseline                  | Verify decision sequences.                                    |
| Locks         | Local lock acquire/contend/release                | plain `Map`/promise queue              | No Redis in this lane.                                        |
| Flags         | Local evaluator, context resolution               | static config read                     | Absolute only.                                                |
| Log           | No-op logger vs enabled JSON logger               | `console` baseline                     | Ensure no synchronous I/O.                                    |
| Telemetry     | Span/metric creation, sampling, exporter batching | no-op tracer                           | Mock exporter; measure allocation.                            |
| Socket        | Envelope encode/decode, fan-out to N subscribers  | raw `JSON.stringify`/`parse`           | Ring buffer already covers the queue.                         |
| Signals       | Decorator/event-bridge overhead                   | raw `@preact/signals-core`             | **Do not** claim the engine is faster; it is the same engine. |
| View          | EJS/TOON/webcomponent SSR, island serialization   | raw EJS, `JSON.stringify`              | Separate render from serialization.                           |
| ORM           | Identity map, criteria queries, 10k scans, batch  | plain `Map` CRUD                       | No database in micro lane.                                    |
| ORM-Drizzle   | SQL generation only                               | hand-written SQL builder               | Do not call this a database benchmark.                        |
| Serialization | JSON vs TOON encode/decode                        | `JSON`                                 | Include model sizes.                                          |
| Auth          | Wrapper overhead around `jose`                    | direct `jose` call                     | The crypto dominates; say so.                                 |

---

## 8. Phase 5 — Automation, baselines, and publication

### 8.1 CI

- Add a **non-gating** nightly or weekly `benchmark` job on the self-hosted
  runner (idle-host assumption documented). Upload the JSON artifact; keep the
  job out of PR required checks.
- Add a manual `workflow_dispatch` input for `quick` vs `full`.
- PR authors run `pnpm test:bench --quick` locally; reviewers require the
  artifact, not a pasted number.

### 8.2 Baseline and regression policy

- Baselines are per hardware class and committed only from the reference host.
- `bench:compare` fails on >10% median regression when RME is acceptable;
  otherwise it reports “inconclusive” and keeps the old baseline.
- A baseline update is its own commit with the artifact and a one-line reason.
- Never compare an absolute number across hardware classes; compare ratios
  within the same run.

### 8.3 Documentation

Create root `BENCHMARKS.md` with:

1. What is measured and why (request path first).
2. How to run: `pnpm bench`, `pnpm bench --quick`, `pnpm bench:compare`.
3. The fairness contract from §2, in user-facing language.
4. Reference environment and hardware class.
5. Results tables: scenario, unit, ndigo, comparator, ratio, RME, n, date.
6. **What this does not prove** (micro ≠ macro, jsdom ≠ browser, single host).
7. Reproduce: commit, commands, artifact path.
8. Change log and expiry dates.

Package READMEs may carry at most one sentence plus a link to
`BENCHMARKS.md`. No README table, no undated number, no claim without a
scenario name.

### 8.4 Release checklist

- Re-run the full lane on the reference host.
- Update `BENCHMARKS.md` from the artifact.
- Re-check every README claim and delete expired ones.
- Publish losses as well as wins; if a scenario regressed, say so.
- Add the artifact link to the release notes when a claim changed.

---

## 9. Acceptance criteria

The plan is complete when:

- [ ] `pnpm test:bench` runs serially, typechecks, finishes in under 10 minutes,
      and writes a JSON artifact with the environment fingerprint.
- [ ] `pnpm bench:compare` fails on a >10% regression against the committed
      reference baseline and reports renamed/removed scenarios.
- [ ] Every retained benchmark has a `verify` step, a unit, and a comparator or
      an explicit “absolute only” marker.
- [ ] The dispatcher README no longer contains an unsupported “3–6x faster”
      claim; any replacement cites `BENCHMARKS.md`.
- [ ] The browser lane either builds and runs Ndigo + React/Svelte/Vue/vanilla
      in Playwright, or every command fails with a clear quarantine message.
- [ ] `BENCHMARKS.md` contains methodology, environment, results, limitations,
      and reproduction commands; package claims link to it.
- [ ] New benchmarks exist for router parity, binding/validation, end-to-end
      HTTP, startup/RSS, DOM, ORM lifecycle, and the parsers with equivalent
      baselines.
- [ ] At least one optimization lands from the refreshed harness (recommended
      first: dispatcher resolution fast path) with before/after artifacts.

---

## 10. Risks and mitigations

| Risk                                     | Impact               | Mitigation                                                             |
| :--------------------------------------- | :------------------- | :--------------------------------------------------------------------- |
| Host noise (desktop, Docker, CI)         | False regressions    | Serial lane, reference host, RME gate, non-gating CI, 5 runs.          |
| Semantic drift                           | Misleading wins      | Mandatory `verify` step; reviewers reject missing parity.              |
| Benchmark maintenance                    | Rot                  | Delete exploration benches; keep only high-value scenarios; typecheck. |
| Competitor version churn                 | Stale ratios         | Pin versions in `benchmarks/package.json`; record resolved versions.   |
| Long build matrix                        | Slow feedback        | `--quick` for PRs; full run nightly; cache bundles.                    |
| Browser flake                            | Unreliable claims    | Playwright only for published numbers; retries; separate lane.         |
| Security/licensing of competitor code    | Supply-chain surface | DevDependencies only, private workspace package, never published.      |
| Public-claim risk                        | Reputation           | Two-person review before publication; publish losses; expiry policy.   |
| Optimizing the benchmark, not the system | Wasted effort        | Verify + real-workload fixtures; review every fixture change.          |

---

## 11. Sequencing and effort

| Phase | Scope                                       | Effort (1 engineer) | Depends on |
| :---- | :------------------------------------------ | :------------------ | :--------- |
| 0     | Integrity, runner, claims quarantine        | 1–2 days            | —          |
| 1     | Refresh existing micro suite                | 3–4 days            | 0          |
| 2     | Router parity, binding, HTTP macro, startup | 4–6 days            | 0, 1       |
| 3     | Browser/DOM lane                            | 3–5 days            | 0          |
| 4     | Coverage expansion                          | 5–8 days            | 1, 2       |
| 5     | CI, baselines, documentation, release gate  | 1–2 days            | 0–4        |

Phases 2 and 3 can run in parallel once Phase 0 lands. Total: roughly **3–4
weeks** for one engineer, less with parallel workstreams.

---

## 12. First ten actions (ordered)

1. Add `vitest.bench.config.ts` (Node environment, serial, no shuffle) and
   confirm the full lane runs in one process per file.
2. Add `scripts/bench-run.mjs` with the JSON reporter, environment
   fingerprint, and result schema; record the first clean baseline.
3. Add `scripts/bench-compare.mjs` and commit the reference baseline.
4. Remove `**/bench/**` from `tsconfig.spec.json` and fix the type errors the
   lane exposes.
5. Fix the duplicate `routing.bench.ts` rows and add the parity/full split;
   verify params and handler identity.
6. Fix the query-string and cookie baselines with equivalent adapters and
   deep-equal verification.
7. Delete `like.bench.ts`; add the production `like` regression bench and the
   native error baseline.
8. Add ORM insert/update/remove-existing scenarios and the Map floor.
9. Correct the dispatcher README claim and guide 45; add `BENCHMARKS.md` with
   methodology and the first clean artifact.
10. Stand up the `benchmarks/` workspace package and the four HTTP apps; run
    the first macro comparison and publish the result — wins and losses.

---

## 13. Decisions needed

| Decision                  | Recommendation                                                                    | Why                                                                                        |
| :------------------------ | :-------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| Reference host            | This workstation for published numbers; self-hosted runner for nightly trend only | The runner is a shared desktop host; absolute numbers must have one stable hardware class. |
| Comparator dependencies   | Private `benchmarks/` workspace package                                           | Keeps Fastify/Express/Hono/autocannon out of published package manifests.                  |
| Browser fixture ownership | Vendor the harness; keep TodoMVC apps external with a pinned commit               | A claim must be reproducible from this repo plus a pinned fixture.                         |
| Regression gating         | Non-gating nightly; manual gate before a release claim                            | Shared-host noise would create false alarms in PR CI.                                      |
| Absolute numbers          | Publish ratios within a run + absolute on the reference host, labelled            | Cross-hardware absolutes are meaningless.                                                  |
| Claims ownership          | Two-person review before publishing a ratio                                       | Prevents a repeat of the “3–6x faster” incident.                                           |
