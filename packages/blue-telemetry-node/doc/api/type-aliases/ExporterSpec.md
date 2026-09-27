[**@blue/telemetry-node v0.0.1**](../README.md)

***

[@blue/telemetry-node](../README.md) / ExporterSpec

# Type Alias: ExporterSpec

> **ExporterSpec** = \{ `console?`: `true`; `headers?`: `Record`\<`string`, `string`\>; `url?`: `string`; \} \| `"console"` \| `"none"`

Per-signal exporter configuration (AD-32 D-2), reaching parity with
`@blue/telemetry-web`'s dev posture:
- `undefined`/`'console'`/`{ console: true }` — console exporter
  (the dev default; a missing url can no longer silently phone the
  default collector);
- `'none'` — the signal's export path is disabled;
- `{ url, headers? }` — OTLP/HTTP, headers forwarded (e.g. bearer auth;
  never logged). A `headers`-only spec still selects OTLP (explicit
  intent), using the default endpoint.
