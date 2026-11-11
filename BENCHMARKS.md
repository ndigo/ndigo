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

Results are generated from the artifact, never typed by hand. Run
`pnpm bench:report` after a full run and copy the table below with the artifact
path and date.

_No published cross-run results yet. The first clean serial baseline is being
recorded; until then, treat the historical numbers in the estate audit as
indicative only._

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
