# Benchmarks

This directory holds the benchmark harness, reference baselines, and raw
results. User-facing methodology and published numbers live in the root
[`BENCHMARKS.md`](../BENCHMARKS.md).

## Layout

```text
benchmarks/
  baselines/reference.json      committed baseline for the reference CPU class
  lib/verify.ts                 equivalence assertion, sink, @ops naming helper
  results/                      per-run JSON artifacts (gitignored)
```

## Commands

```bash
pnpm bench            # full serial run; writes a JSON artifact and compares the baseline
pnpm bench:quick      # one run, no baseline comparison
pnpm bench:update     # run and replace the committed baseline
pnpm bench:compare    # compare the newest artifact to the baseline
pnpm bench:report     # render the newest artifact as Markdown
pnpm build && pnpm bench:http  # macro HTTP lane (connection-close; see caveat)
```

`pnpm test:bench` is an alias for `pnpm bench`.

## Rules for benchmark files

1. **One logical operation per measured iteration.** If an iteration performs
   N operations, append `@ops=N` to the benchmark name via `benchName(name, N)`.
   The runner strips the suffix and divides batch latency by N.
2. **Setup outside the measured body.** Build fixtures at module scope or in a
   `beforeEach`/`beforeAll` hook. Never construct the thing you are measuring
   inside the timed function unless construction is the subject.
3. **Verify equivalence before timing.** Call `assertEquivalent` once before
   `bench.compare`. If the candidate and comparator disagree, the benchmark
   fails instead of publishing a misleading ratio.
4. **Keep the sink observable.** Use `sink(value)` (aliased to a local
   `retain`) so V8 cannot discard the work.
5. **Label semantics.** A row that does less work than the candidate is a
   “floor,” not an alternative. Say so in the benchmark name or the file
   header.
6. **No numbers in package READMEs.** Publish through `BENCHMARKS.md`, which
   cites the artifact, commit, environment, and limitations.

## Artifact shape

Each run records `schemaVersion`, `environment` (commit, dirty flag, date,
Node, pnpm, OS/kernel, CPU, cores, memory, governor, load average), per-file
durations, and one entry per scenario with `nsPerOp`, `opsPerSecond`, latency
percentiles, RME, and sample count.

The lane runs one benchmark file per child process with
`vitest.bench.config.ts` (Node environment, one worker, no file parallelism,
no shuffled order). The JSON reporter supplies the raw task statistics.

The macro HTTP lane (`benchmarks/http/`) is separate: it starts one app at a
time, verifies the four routes, and runs autocannon with `Connection: close`.
Close mode is deliberate — Ndigo's chunked responses make autocannon's
keep-alive status counter report false 5xx results. Treat the resulting request
rates as a connection-per-request comparison, not a production keep-alive
throughput claim. Ndigo runs from source through `tsx`; run `pnpm build` first
so the framework packages have `lib/` output.

## Known measurement caveat

Vitest may print “accessed module export getters too many times” when framework
internals import through package barrels. Benchmark files import concrete
modules where possible; the remaining warnings are a property of the shipped
import graph and apply to every candidate in the same row. They are reported,
not silently suppressed.
