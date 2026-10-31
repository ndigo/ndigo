[**@blue/telemetry-node v0.0.1**](../README.md)

***

[@blue/telemetry-node](../README.md) / ExporterSpec

# Type Alias: ExporterSpec

> **ExporterSpec** = \{ `console?`: `true`; `headers?`: `Record`\<`string`, `string`\>; `url?`: `string`; \} \| `"console"` \| `"none"` \| `"prometheus"`

Per-signal exporter configuration (AD-32 D-2), reaching parity with
`@blue/telemetry-web`'s dev posture:
- `undefined`/`'console'`/`{ console: true }` — console exporter
  (the dev default; a missing url can no longer silently phone the
  default collector);
- `'none'` — the signal's export path is disabled;
- `'prometheus'` — **metric signal only** (AD-77 D-1): registers the pull
  [PrometheusMetricReader](../classes/PrometheusMetricReader.md) instead of the periodic push reader, and
  serves the meter state through `GET /metrics` in the Prometheus text
  exposition format (plus the JSON projection);
- `{ url, headers? }` — OTLP/HTTP, headers forwarded (e.g. bearer auth;
  never logged). A `headers`-only spec still selects OTLP (explicit
  intent), using the default endpoint.
