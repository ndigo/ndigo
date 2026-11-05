# Prometheus metrics, semconv duration, meter-derived `/metrics` — `@ndigo/telemetry-node` + `@ndigo/management` + `@ndigo/telemetry`

**Date:** 2026-10-08
**Status:** Executed (2026-10-08 — see §8)
**Decision:** [AD-77](../decisions/2026-10-08_AD77_PROMETHEUS_METRICS.md)
**Scope:** GAP-5 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): the OTel-metrics
track — a Prometheus exporter, the semconv `http.server.request.duration`
metric, and a `/metrics` view derived from the meter provider instead of the
parallel `FeatureMetricAggregator` pipeline. Runs in parallel with GAP-4
(actuator parity, [2026-10-08_ACTUATOR_PARITY.md](2026-10-08_ACTUATOR_PARITY.md))
per the Wave-6 roadmap.

---

## 1. Problem

Three facts verified at HEAD:

1. **No pull export.** `configureTelemetry`'s `metricExporter` resolves to
   `console`, `none`, or `otlp` (AD-32) — all push. Prometheus scrapers need
   an HTTP endpoint serving the text exposition format.
2. **No semconv duration metric.** `HTTPServerInstrumentation` writes spans
   with semconv attributes but never records the request duration metric —
   the histogram peer stacks ship (`http.server.request.duration`).
3. **`/metrics` diverges from the exported stream.** `MetricsController`
   serializes the `FeatureMetricAggregator`, which only contains counters
   explicitly handed an aggregator reference; the JSON view and the OTLP
   export are independent pipelines that can disagree.

## 2. Current state (verified 2026-10-08)

| Seam                 | Today                                                                                                                                          | Missing for GAP-5                                                   |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| Exporter spec        | `ExporterSpec = { url?, headers?, console? } \| 'console' \| 'none'`; `resolveExporter` pure shape table (spec'd in `exporter-config.spec.ts`) | a `prometheus` kind (metric signal only)                            |
| SDK wiring           | `metricReaders = [PeriodicExportingMetricReader(console\|otlp)]` or `[]` (`node-config.ts:154-169`)                                            | a pull reader registered with the `MeterProvider`                   |
| Instruments          | `createLazyCounter` (first-call meter resolution — never captures NoopMeter)                                                                   | histogram creation (same lazy pattern) for the duration metric      |
| HTTP instrumentation | SERVER span with `http.request.method` / `url.path` / `http.response.status_code`; success `.then` + error `.catch` paths                      | `http.server.request.duration` histogram recording at both paths    |
| `/metrics`           | `MetricsController` → `{ features }` from the context `FeatureMetricAggregator` (`metrics-controller.ts:32-58`)                                | meter-derived view + Prometheus text                                |
| Snapshot seam        | none (management reads the aggregator token)                                                                                                   | sdk-free snapshot model + global provider slot (zero-wiring parity) |

Versions that make this dependency-free: `@opentelemetry/sdk-metrics` 2.11
(`MetricReader.collect()` pulls from the bound producer; explicit-bucket
histogram via `advice.explicitBucketBoundaries` under the default
aggregation) and `@opentelemetry/api` 1.9.1 (`Meter.createHistogram`) —
both already in `@ndigo/telemetry-node`'s dependency closure.

## 3. Change

### Wave 1 — Snapshot model + text renderer (`@ndigo/telemetry`, isomorphic)

- `src/metrics/metric-snapshot.ts`: `MetricPoint` (attributes + either a
  scalar value or a histogram stat block), `MetricSnapshot` (name,
  description, unit, dataPointType), `MetricSnapshotProvider`
  (`collect(): Promise<readonly MetricSnapshot[]>`), and the single-slot
  registry `registerMetricSnapshotProvider` / `unregisterMetricSnapshotProvider`
  / `getMetricSnapshotProvider` (OTel global-provider pattern; no-op default).
- `src/metrics/prometheus-text.ts`: `renderPrometheusText(snapshots) -> string`
  — `# TYPE`/`# HELP` per metric; sums → `counter`, gauges → `gauge`,
  histograms → `<name>_count` + `<name>_sum`; sorted, grammar-escaped
  attributes; deterministic ordering. Pure, sdk-free, unit-testable.
- **Acceptance:** serializer spec — counter/gauge/histogram lines, escaping,
  attribute sort order, empty snapshot → comment-only document; registry spec
  — register/read/unregister lifecycle. Fail-before/pass-after.

### Wave 2 — SDK reader + exporter wiring (`@ndigo/telemetry-node`)

- `src/metrics/prometheus-metric-reader.ts`: `PrometheusMetricReader extends
  MetricReader` — `onShutdown`/`onForceFlush` no-ops; `snapshot()` calls the
  inherited `collect()` and projects `CollectionResult.resourceMetrics.scopeMetrics`
  to `MetricSnapshot[]`; unbound/shutdown → `[]` (never a 500).
- `node-config.ts`: `ExporterSpec` + `ResolvedExporter` gain the
  `'prometheus'` kind; `resolveExporter` rejects it for `trace`/`log` (fail
  loud, naming the signal); `configureTelemetry` builds
  `metricReaders = [new PrometheusMetricReader()]` and registers it as the
  snapshot source after `sdk.start()`.
- `lazy-counter.ts`: generalize to a shared lazy-instrument cache; add
  `createLazyHistogram` (uses `createHistogram` with the semconv advice).
- **Acceptance:** exporter-config spec — `'prometheus'` resolves to
  `{kind:'prometheus'}` for metric, throws for trace/log; reader spec over a
  real `MeterProvider` — counters/gauges/histograms project into the
  snapshot shape, values correct, unbound reader → `[]`. Fail-before/pass-after.

### Wave 3 — Semconv duration metric (`@ndigo/telemetry-node`)

- `HTTPServerInstrumentation`: measure the adapter call with
  `performance.now()`; on both the `.then` and `.catch` paths record
  `http.server.request.duration` (histogram, unit `s`, semconv description,
  bucket advice `[0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10]`
  seconds) with attributes `http.request.method` and
  `http.response.status_code` (the catch path records the code the adapter
  would have written for a dispatch failure).
- **Acceptance:** instrumentation spec with a recording meter — exactly one
  duration datapoint per completed request on each path, with the two
  attributes; unit `s`. Fail-before/pass-after.

### Wave 4 — `/metrics` derives from the meter (`@ndigo/management`)

- `MetricsController.metrics(accept)` binds the `Accept` header
  (`headerValue('Accept')`): JSON media type (browser default) → the new
  `{ metrics: { <name>: { description?, unit, type, points } } }` projection;
  `text/plain` / `application/vnd.prometheus*` / absent / `*/*` → the
  Prometheus text document with
  `Content-Type: text/plain; version=0.0.4; charset=utf-8` (raw-string
  `ResponseEntity` — the platform's pre-existing non-JSON body path).
  No snapshot source → `{ error: 'No metric source wired' }` (unchanged
  error-document posture).
- The `{ features }` aggregator document is removed; `FeatureMetricAggregator`
  stays for health + `@counted`.
- **Acceptance:** endpoint spec — text by default; JSON with an explicit
  `Accept: application/json`; security headers on both; error document when
  no source. Fail-before/pass-after. All management specs updated.

### Wave 5 — Docs, demo, gates

- Guide 10 (telemetry): exporter table gains `'prometheus'`; new section on
  the pull endpoint + semconv metric. Guide 26: `/metrics` contract (text
  default, JSON projection, migration note for `{ features }`). Management +
  telemetry-node READMEs, guide 03 `telemetry.metricExporter` row, CHANGELOG
  (AD-77), decisions + plans indexes, ADR-77 + this plan.
- `apps/17-ndigo-telemetry-lab`: enable `metricExporter: 'prometheus'` behind
  an env var (the lab is the metrics demo; its README documents the scrape
  flow).
- Gates: the full set of the review plan §9 (incl. the spec-typecheck lane),
  `pnpm doc` freshness, `graft build`.

## 4. Deliberately out of scope

- Multiple concurrent metric readers (OTLP push **and** Prometheus pull in one
  process): a future `metricReaders` array knob — one exporter per signal
  stays the AD-32 config model.
- `prom-client` or any third-party metric registry: the meter provider is the
  single source of truth; rendering is a projection, not a second registry.
- Prometheus push gateway / remote-write protocol: text exposition over the
  existing HTTP stack is the scrape contract.
- Histograms in the JSON view beyond the meter's own `MetricData` (buckets,
  count, sum, min, max are projected as-is).

## 5. Decisions to ratify (ADR-77)

1. **`metricExporter: 'prometheus'`** — metric signal only; pull replaces
   push for the process (one reader slot).
2. **The exporter is an SDK `MetricReader`**; the endpoint never touches SDK
   types — the isomorphic snapshot model is the seam.
3. **One global `MetricSnapshotProvider` slot** registered by
   `configureTelemetry`, read per request by management — zero wiring.
4. **Text by default, JSON as an explicit `Accept` projection** — one
   snapshot, two wire forms; `{ features }` removed.
5. **Prometheus projection rules** — histograms → `<name>_count`/`<name>_sum`;
   names verbatim; sorted legal escaping.
6. **`http.server.request.duration`** — histogram in seconds, semconv
   boundaries + attributes, recorded on both request paths.

## 6. Verification protocol

```bash
# Per wave: fail-before/pass-after specs, then:
pnpm --filter @ndigo/telemetry test && pnpm --filter @ndigo/telemetry-node test \
  && pnpm --filter @ndigo/management test && pnpm build && pnpm test \
  && pnpm lint && pnpm format:check && pnpm docs:links && pnpm manifest:check \
  && pnpm typecheck && pnpm test:tooling && pnpm doc \
  && git diff --exit-code -- packages doc
# Live smoke (telemetry lab or any app with the instrumentation):
#   curl -H 'Accept: text/plain' localhost:/metrics  -> text doc with
#     http_server_request_duration_count / _sum lines
#   curl -H 'Accept: application/json' localhost:/metrics -> { metrics: {...} }
#   curl localhost:/metrics (no Accept) -> text doc
```

Acceptance for closure: every wave's fail-before/pass-after exists; the full
gate set is green with regenerated API docs; `graft build` refreshed.

## 7. Execution log (2026-10-08)

All waves landed in this cycle, ADR-77 accepted; the full gate set (§6) is
green below with regenerated API docs.

- **Wave 1 — Snapshot model + renderer (`@ndigo/telemetry`).**
  `metric-snapshot.ts` (`MetricPoint`, `MetricSnapshot`, `MetricSnapshotProvider`,
  single-slot registry) + `prometheus-text.ts` (grammar-accurate renderer:
  `# TYPE`/`# HELP`, counter/gauge/histogram projection, escaping, sorted
  attributes) + `metric-json.ts` (the `{ metrics: { name } }` projection).
  Pure and sdk-free; serializer + registry specs landed.
- **Wave 2 — SDK reader + wiring (`@ndigo/telemetry-node`).**
  `PrometheusMetricReader extends MetricReader` (`onShutdown`/`onForceFlush`
  no-ops; `snapshot()` projects `collect()` into the isomorphic model;
  unbound → `[]`). `ExporterSpec`/`ResolvedExporter` gain `'prometheus'`;
  `resolveExporter` rejects it for trace/log. `configureTelemetry` registers
  the reader as the metric reader and the global snapshot source.
  `lazy-counter.ts` generalized; `createLazyHistogram` added.
- **Wave 3 — Semconv duration.** `HTTPServerInstrumentation` records
  `http.server.request.duration` (unit `s`, semconv bucket advice, method +
  status attributes) on the success and error paths.
- **Wave 4 — `/metrics`.** `MetricsController` binds `Accept`, serves the
  Prometheus text document by default (raw-string `ResponseEntity`,
  `text/plain; version=0.0.4`), JSON on explicit accept, `{ error }` when no
  source; the `{ features }` aggregator document is gone.
- **Wave 5 — Docs, demo, gates.** Guide 10 + guide 26 + the three READMEs +
  guide 03 row + CHANGELOG (AD-77) + decision/plan indexes; the telemetry lab
  gains the `prometheus` exporter env switch.

### Final verification

`pnpm build` · `pnpm --filter @ndigo/telemetry test` (incl. the serializer +
registry specs) · `pnpm --filter @ndigo/telemetry-node test` (incl.
`prometheus-metric-reader.spec.ts`, the exporter-config additions, the
http-server duration spec) · `pnpm --filter @ndigo/management test` (incl. the
reworked `/metrics` endpoint spec) · `pnpm test` · `pnpm lint` 0 diagnostics ·
`pnpm format:check` · `pnpm typecheck` (build + spec lane) · `pnpm docs:links`
· `pnpm audit --prod` · `pnpm manifest:check` · `pnpm agents:check` ·
`pnpm test:tooling` · `pnpm doc` (regenerated API docs committed) ·
`graft build` refreshed.
