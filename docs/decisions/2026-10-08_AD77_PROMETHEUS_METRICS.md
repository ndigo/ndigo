# AD-77: Prometheus metrics, semconv duration, and a meter-derived `/metrics`

**Date:** 2026-10-08
**Status:** Accepted
**Deciders:** Framework owner (GAP-5 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6, refreshed in `…_AD72_75.md` §5)

---

## Context

GAP-5 rates OTel metrics + Prometheus + semconv names **high** / 1.0-severity.
Its status line corrects the prior review: "metrics are not OTel" was wrong —
OTLP metric export and OTel counters predate the baseline. What is actually
missing:

1. **No Prometheus exporter.** The OTel meters only push (OTLP/HTTP or
   console, AD-32); there is no pull endpoint Prometheus can scrape.
2. **Semconv metric names.** `HTTPServerInstrumentation` emits spans with
   semconv attributes (`http.request.method`, `url.path`,
   `http.response.status_code`) but **no `http.server.request.duration`
   metric** — the histogram every peer framework exports for request
   latency observability.
3. **`/metrics` is proprietary JSON.** `MetricsController` serializes the
   `FeatureMetricAggregator` — a parallel, feature-scoped pipeline that only
   sees counters whose decorator was hand-wired an aggregator reference. The
   JSON view and the exported OTel stream disagree by construction.

Recommendation from the review: _add Prometheus exporter + semconv emission;
derive the JSON view from the meter provider_. No new runtime dependency is
needed: `@opentelemetry/sdk-metrics` 2.11 is already a dependency of
`@ndigo/telemetry-node` and its `MetricReader.collect()` is a public pull
contract (the base class resolves the bound `MetricProducer` itself);
`@opentelemetry/api` 1.9.1 ships `Meter.createHistogram` with
`advice.explicitBucketBoundaries`, and the SDK's default aggregation honors
that advice with an explicit-bucket `HistogramAggregator` (verified in the
installed `view/Aggregation.js`).

## Evidence

- `packages/ndigo-telemetry-node/src/node-config.ts:135-199` — the reader list
  is built from `metricExporter` (`console`/`none`/`otlp`); `ResolvedExporter`
  has three kinds; adding a fourth is a pure-shape change plus one `NodeSDK`
  wiring branch.
- `packages/ndigo-telemetry/src/metrics/lazy-counter.ts` — the lazy-instrument
  pattern (defer `metrics.getMeter()` to first recording so the NoopMeter is
  never captured); the same pattern applies to a histogram.
- `packages/ndigo-telemetry-node/src/instrumentation/http-server/http-server.ts:44-108`
  — the per-request SERVER span wrap has both a success (`span.end()` in
  `.then`) and an error path (`.catch`); the metric records at the same two
  points.
- `packages/ndigo-management/src/metrics-controller.ts` — reads the context
  `METRIC_AGGREGATOR` and returns `{ features }`; the endpoint's JSON and the
  exported stream are independent data.
- Installed `@opentelemetry/sdk-metrics` 2.11 (`build/src/export/MetricReader.js`:
  concrete `collect()` pulls from the bound producer; `onInitialized()` fires
  once the `MeterProvider` binds; `build/src/view/Aggregation.js`:
  `DefaultAggregation` maps `HISTOGRAM` + `advice.explicitBucketBoundaries` →
  `ExplicitBucketHistogramAggregation`, so
  `http.server.request.duration` aggregates into the semconv bucket set).
- OpenTelemetry semantic conventions (HTTP server metrics):
  `http.server.request.duration` is a histogram in seconds with
  `http.request.method` and `http.response.status_code` attributes; the
  recommended explicit bucket boundaries in seconds are
  `[0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10]`.

## Decision

### D-1 — `metricExporter: 'prometheus'` selects a pull reader (metric signal only)

`ExporterSpec` gains the literal `'prometheus'`, and `ResolvedExporter`
gains `{ kind: 'prometheus' }`. `resolveExporter` rejects the value for the
`trace` and `log` signals (fail loud, naming the signal — the same posture as
invalid OTLP urls). `configureTelemetry` then registers a
`PrometheusMetricReader` as the SDK's metric reader instead of the
`PeriodicExportingMetricReader`, and registers it as the process's metric
snapshot source (D-3). Selecting `prometheus` selects pull-over-push: one
reader slot, one export mode — combining OTLP push and Prometheus pull in one
process is a future knob (a `metricReaders` array), not this ADR.

### D-2 — The exporter is a real SDK `MetricReader`

`PrometheusMetricReader extends MetricReader` (sdk-metrics). It overrides only
the two abstract lifecycle hooks (`onShutdown`/`onForceFlush` no-ops — a pull
reader holds nothing between requests) and exposes
`snapshot(): Promise<readonly MetricSnapshot[]>` which calls the inherited
`collect()` and projects the `CollectionResult` into plain data (name,
description, unit, dataPointType, points). Unbound/shutdown readers answer an
empty snapshot instead of throwing, so the endpoint degrades to the
"no metric source" document rather than a 500.

### D-3 — One global `MetricSnapshotProvider` slot; management reads it per request

`@ndigo/telemetry` (isomorphic — no SDK types) gains the snapshot model and a
single-slot registry (`registerMetricSnapshotProvider` / `unregister` /
`get`), mirroring the OTel global-provider pattern the codebase already
embraces. `configureTelemetry` registers the reader after `sdk.start()`;
`MetricsController` reads the registry at request time. Result:
`configureTelemetry` + `ManagementAutoConfiguration` agree with **zero
wiring** — the same composition story the aggregator had, minus the
hand-off. `FeatureMetricAggregator` stays (it feeds `TelemetryHealthIndicator`
and the `@counted` feature option) but ceases to be the `/metrics` source.

### D-4 — `/metrics` serves Prometheus text by default; JSON is a projection of the same snapshot

Content negotiation on the `Accept` header: a JSON media type
(`application/json`, `application/*+json` — browsers) selects the JSON
projection; `text/plain` or `application/vnd.prometheus*` selects the text
document; absent/`*/*`/unknown headers default to **Prometheus text** — the
operationally useful shape for the endpoint the gap complained about. Both
views render the same `MetricSnapshot[]` from D-2/D-3 — one source of truth,
two wire forms. The JSON document becomes
`{ metrics: { <name>: { description?, unit, type, points } } }`; the
aggregator's `{ features }` document is removed (breaking change, documented
in guide 26; all consumers in-repo are tests, updated with the ADR).

### D-5 — Prometheus rendering is a documented projection of OTel data

The exposition format has no histogram type, so rendering follows the
stable projection: sums → `counter` lines, gauges → `gauge` lines, histograms
→ a `<name>_count` counter plus a `<name>_sum` gauge per datapoint. OTel
metric names are emitted verbatim (dots are legal in the exposition grammar
`[a-zA-Z_:][a-zA-Z0-9_:.]*`); attribute names/values are escaped per the
grammar (`\` → `\\`, `"` → `\"`, newline → `\n`) and emitted in sorted order
(attribute maps are unordered; deterministic output is the testable contract).
Each metric gets `# TYPE`/`# HELP` comment lines.

### D-6 — `HTTPServerInstrumentation` emits the semconv duration metric

The per-request wrap records `http.server.request.duration` (histogram,
unit `s`, description per semconv) with `http.request.method` and
`http.response.status_code` attributes, on both the success and the error
path, measured with `performance.now()` around the adapter call. The
instrument is created lazily on first request (the `createLazyCounter`
pattern, generalized) with the semconv explicit bucket boundaries from the
context section. `url.path` is deliberately not an attribute — the metric is
aggregated server-side, and the instrumentation layer does not know routes
(the span already documents this for `http.route`).

## Consequences

- `@ndigo/telemetry` gains a pure snapshot model + registry + Prometheus-text
  renderer (sdk-free); `@ndigo/telemetry-node` gains the SDK reader and the
  exporter-spec branch; `@ndigo/management`'s controller reads the registry —
  no new runtime dependencies anywhere.
- `GET /metrics` with an `Accept: application/json` browser header still
  returns JSON, but the document is now the meter projection; clients
  scraping without an Accept header get Prometheus text. The
  `{ features }` shape is gone — the drift between the exported stream and
  the endpoint cannot recur because they are the same stream.
- `http.server.request.duration` appears in every export mode (console, OTLP,
  prometheus) once `HTTPServerInstrumentation` is enabled — this is the
  semconv-name part of GAP-5.
- One exporter per signal stays the config model; combining OTLP push with
  Prometheus pull requires the future `metricReaders` knob.
- GAP-5 closes.

## References

- Review: `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 (GAP-5),
  §8 (Wave 6 — "GAP-4/GAP-5 … in parallel … reuse the existing meter provider")
- Plan: `docs/plans/2026-10-08_PROMETHEUS_METRICS.md`
- Semantic conventions: [HTTP server metrics — `http.server.request.duration`](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/)
- Prometheus text exposition format (grammar, escaping, `# TYPE`/`# HELP`)
- Related decisions: [AD-32](2026-09-26_AD32_TELEMETRY_COMPLETION.md)
  (per-signal exporters; the `ExporterSpec` this extends),
  [AD-36](2026-09-28_AD36_MANAGEMENT_HARDENING.md) (management posture),
  [AD-76](2026-10-08_AD76_ACTUATOR_PARITY.md) (the management surface GAP-5
  runs in parallel with)
