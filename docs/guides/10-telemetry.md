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

| Spec                                              | Effect                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `undefined` or `'console'` or `{ console: true }` | console exporter — the safe dev default; a missing url can no longer silently phone the default collector |
| `'none'`                                          | the signal's export path is disabled                                                                      |
| `{ url, headers? }`                               | OTLP/HTTP; headers (e.g. bearer auth) are forwarded and never logged                                      |

OTLP urls are validated at configuration time — typos fail loud instead of
failing at export time.

## 4. Correlation

Logs already carry trace context: set `LoggerFactory.contextAware = true`
and the logger stamps `trace.id` / `span.id` attributes when a span is
active. For non-logger consumers (queue payloads, outbound headers,
custom sinks), read the ids directly:

```ts
import { currentTraceContext } from '@blue/telemetry';

const correlation = currentTraceContext(); // { traceId, spanId } | undefined
await queue.push({ ...payload, 'trace.id': correlation?.traceId });
```

`undefined` means no span is active — safe in pure-logging mode.

## 5. Browser

`configureBrowserTelemetry` (from `@blue/telemetry-web`) is the browser
side: W3C trace context on the wire, `traceUrl`-missing → console exporter,
`useConsoleExporters: false` to disable, `enableDiagnostics` for OTel
diagnostics output.

## Limits

- **Node**: `@blue/telemetry-node` manufacturers the exporter/processor
  plumbing; OTel env vars (`OTEL_*`) keep native precedence for raw OTel
  consumers — mixing the BlueJS options with `OTEL_*` is unsupported (one
  source of truth per deployment).
- See `docs/plans/2026-09-26_TELEMETRY_COMPLETION.md` and
  `docs/decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md` for decisions
  and known edge semantics.

## Package surfaces

- `@blue/telemetry` — loggers, `currentTraceContext`, metrics, severity,
  tracing decorators (API-only)
- `@blue/telemetry-node` — `configureTelemetry`, node instrumentations
- `@blue/telemetry-web` — `configureBrowserTelemetry`
