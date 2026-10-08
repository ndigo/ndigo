# Guide 10 — Telemetry

How telemetry works in BlueJS: OpenTelemetry traces, metrics, and logs for
Node and browser, the `configureTelemetry` knobs (sampling, exporters), and
log↔trace correlation tooling. Node config lives in `@blue/telemetry-node`
(OTel `NodeSDK` wrapper); browser config in `@blue/telemetry-web`.

## 1. Quickstart (node)

Configure once **at boot** — the OpenTelemetry API registers global
providers once per process, so the first call wins and later calls are
ignored with a loud warning (`AD-32`):

```ts
import { configureTelemetry, HTTPServerInstrumentation } from '@blue/telemetry-node';

const sdk = configureTelemetry({
    traceExporter: {
        url: 'http://collector:4318/v1/traces',
        headers: { Authorization: `Bearer ${process.env['OTEL_COLLECTOR_TOKEN']}` },
    },
    metricExporter: { url: 'http://collector:4318/v1/metrics' },
    logExporter: { url: 'http://collector:4318/v1/logs' },
    instrumentations: [new HTTPServerInstrumentation()],
});
```

Save the returned `sdk` handle: traces, metrics, and logs are batched, so
call `sdk.shutdown()` during graceful teardown or the last batch is dropped
on exit (§6).

## 2. Sampling (traces)

`sampler` tunes how many root spans are kept — child spans inherit the root
decision (parent-based):

```ts
configureTelemetry({
    sampler: { ratio: 0.1 }, // keep ~10% of roots — the cost-control knob
    // 'always' (default, 100%) | 'off' | a raw OTel Sampler
});
```

Ratios outside `[0, 1]` and NaN fail loud at configuration time.

## 3. Exporters

Each signal (`traceExporter` / `metricExporter` / `logExporter`) accepts:

| Spec                                              | Effect                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `undefined` or `'console'` or `{ console: true }` | console exporter — the safe dev default; a missing url can no longer silently phone the default collector                                                     |
| `'none'`                                          | the signal's export path is disabled                                                                                                                          |
| `'prometheus'`                                    | **metric signal only** (AD-77): registers the pull reader instead of the periodic push exporter; the management `/metrics` endpoint serves the meter snapshot |
| `{ url, headers? }`                               | OTLP/HTTP; headers (e.g. bearer auth) are forwarded and never logged                                                                                          |

OTLP urls are validated at configuration time — typos fail loud instead of
failing at export time.

### The metrics pull view — Prometheus and `/metrics` (AD-77)

`metricExporter: 'prometheus'` replaces the push pipeline for metrics with a
**pull reader over the SDK `MeterProvider`** — the same instruments, exposed
for scraping. Combined with
[`ManagementAutoConfiguration`](26-management-endpoints.md):

```ts
configureTelemetry({
    metricExporter: 'prometheus', // metric-only: pull replaces push
    instrumentations: [new HTTPServerInstrumentation()],
});
// + ManagementAutoConfiguration in the app builder
```

- `GET /metrics` serves the **Prometheus text exposition** document by
  default (`text/plain; version=0.0.4`) — the scraper contract. An
  `Accept: application/json` (or `application/*+json`) header returns the
  same snapshot as JSON (`{ metrics: { <name>: { type, unit, points } } }`);
  both views derive from the one meter snapshot, so the exported and the
  scraped picture can never diverge. Without a configured snapshot source
  the endpoint answers `{ "error": "No metric source wired" }`.
- Histograms render as the `<name>_count` counter + `<name>_sum` gauge pair
  (the exposition format has no histogram type); averages derive the
  usual way (`sum / count`).
- `HTTPServerInstrumentation` records the semconv
  **`http.server.request.duration`** histogram (seconds, explicit semconv
  buckets, `http.request.method` + `http.response.status_code` attributes)
  for every completed request — in **every** export mode, Prometheus or
  OTLP alike.

`'prometheus'` is rejected for `traceExporter` / `logExporter` at
configuration time (fail loud, naming the signal). One exporter per signal
per process: combining OTLP push with Prometheus pull needs a future
`metricReaders` knob.

Configuring a `logExporter` (anything but `'none'`) also switches
`LoggerFactory` to the OpenTelemetry logger (browser parity), so
`getLogger(...)` output flows through the configured log pipeline. Without a
`logExporter` the factory keeps its console default.

## 4. Correlation

Logs already carry trace context: set `LoggerFactory.setContextAware(true)`
and the logger stamps `traceId` / `spanId` attributes when a span is
active. For non-logger consumers (queue payloads, outbound headers,
custom sinks), read the ids directly:

```ts
import { currentTraceContext } from '@blue/telemetry';

const correlation = currentTraceContext(); // { traceId, spanId } | undefined
await queue.push({ ...payload, traceId: correlation?.traceId, spanId: correlation?.spanId });
```

`undefined` means no span is active — safe in pure-logging mode.

## 5. Browser

`configureBrowserTelemetry` (from `@blue/telemetry-web`) is the browser
side: W3C trace context on the wire, `traceUrl`-missing → console exporter,
`useConsoleExporters: false` to disable, `enableDiagnostics` for OTel
diagnostics output.

## 6. Graceful shutdown (node)

`configureTelemetry` returns the started OTel `NodeSDK`. Its trace/log
processors and metric readers are batched, so anything not yet exported is
dropped when the process exits — shut the SDK down on the way out to flush
the final batch and stop the export timers:

```ts
import { gracefulShutdown, HTTP_SERVER } from '@blue/platform-node';

const sdk = configureTelemetry({
    traceExporter: { url: 'http://collector:4318/v1/traces' },
});
const server = context.getValue(HTTP_SERVER);
await server.start();

gracefulShutdown(context, {
    resources: [
        server,
        // Flush batched telemetry after the server stops — its shutdown
        // spans are still exported — and before the context closes.
        { close: () => sdk.shutdown() },
    ],
});
```

When no collector is configured (`sdk` is `undefined`), omit the shutdown
resource. Apps that never call `shutdown()` lose whatever the batch
processors had not yet exported.

## Limits

- **Node**: `@blue/telemetry-node` manufacturers the exporter/processor
  plumbing; OTel env vars (`OTEL_*`) keep native precedence for raw OTel
  consumers — mixing the BlueJS options with `OTEL_*` is unsupported (one
  source of truth per deployment).
- See `docs/plans/2026-09-26_TELEMETRY_COMPLETION.md` and
  `docs/decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md` for decisions
  and known edge semantics.

## Package surfaces

- `@blue/log` — loggers, severity mappings (dependency-light leaf)
- `@blue/telemetry` — `currentTraceContext`, metrics, tracing decorators,
  framework instrumentations; re-exports the logging surface from `@blue/log`
- `@blue/telemetry-node` — `configureTelemetry`, node instrumentations
- `@blue/telemetry-web` — `configureBrowserTelemetry`
