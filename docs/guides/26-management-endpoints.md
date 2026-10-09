# Management Endpoints (Actuator Parity)

The management surface serves the operations endpoints every peer framework
ships: `/health` + `/metrics` from day one (AD-36), and — since AD-76 — the
actuator-parity set `/loggers`, `/env`, `/configprops` and composed health
groups. Everything lives behind the one `ManagementAutoConfiguration` entry
point and the single access-guard model; the endpoints are **open by
default**, so the security posture from guide 11 (guard + boundary firewall)
applies to everything below.

Reference application: `apps/04-blue-api` (the demo exposes the full surface).

## 1. Enabling the endpoints

`@blue/management`'s `ManagementAutoConfiguration` ships with the framework
default posture: **only `/health` and `/metrics` are served**. The other
endpoints are opt-in, so nothing new is reachable without operator action:

| Endpoint id   | Serves                                                        | Default |
| :------------ | :------------------------------------------------------------ | :------ |
| `health`      | aggregate + components + groups                               | on      |
| `metrics`     | the meter snapshot: Prometheus text + JSON projection (AD-77) | on      |
| `loggers`     | level index, per-logger reads + changes                       | off     |
| `env`         | property sources with origins                                 | off     |
| `configprops` | declared `@configurationProperties` keys                      | off     |

Configure exposure in `config/application.json`:

```json
{
    "management": {
        "endpoints": {
            "exposure": { "include": ["loggers", "env", "configprops"] }
        }
    }
}
```

`"include": ["*"]` serves every endpoint; `exclude` withholds (wins over
`include`); unknown ids are ignored. Programmatic options win over the file:
`new ManagementAutoConfiguration({ exposure: { include: ['*'] } })` (apps
pass options by subclassing, like `SecureDocsConfiguration`).

A disabled endpoint answers `404`; it is never half-armed. When an
`accessGuard` is configured it covers every management path, exposed or not.

> **Security note.** `/loggers` can redirect a process's log volume and
> `/env`/`/configprops` reveal configuration structure. On an untrusted
> network, pass an _unconditional_ guard (token-presence / token-adapter —
> a metadata-driven guard cannot protect these handlers, which carry no
> `@authenticated`/`@authorized` metadata) and/or firewall the paths at the
> network boundary (AD-36 posture). `/metrics` reveals application
> telemetry — the same posture applies once a Prometheus exporter is
> configured.

## 2. `/metrics` — the meter snapshot (AD-77)

`/metrics` is the **pull view over the OpenTelemetry meter provider**: one
snapshot, two wire forms. Registering
[`ManagementAutoConfiguration`](../../packages/blue-management/README.md)
serves it; configuring `metricExporter: 'prometheus'` (guide 10 §3)
registers the reader that backs it — neither needs the other to boot.

- **Prometheus text by default.** `GET /metrics` returns the exposition
  document (`Content-Type: text/plain; version=0.0.4`) — the contract a
  Prometheus scraper consumes. Histograms render as the `<name>_count`
  counter + `<name>_sum` gauge pair (the format has no histogram type).
- **JSON projection on explicit accept.** `Accept: application/json` (or
  any `application/*+json` type) returns the same snapshot as
  `{ metrics: { <name>: { type, unit, description?, points } } }`.
- **No telemetry → feature-aggregator fallback (REV-003).** Without a
  registered pull reader (no `configureTelemetry` /
  `metricExporter: 'prometheus'`), the endpoint serves
  `ManagementAutoConfiguration`'s feature aggregator: counters/gauges/
  durations from `counted` / `FeatureMetricAggregator` render as
  `{feature}.{name}` snapshots (durations as the histogram count/sum pair).
  With neither a reader nor the auto-configuration present, the endpoint
  answers `{ "error": "No metric source wired" }`.

The view is per-request: every scrape re-collects from the
`MeterProvider`, so the endpoint always shows live aggregated state and
needs no periodic flush. The pre-AD-77 `{ features }` aggregator document is
gone — `/metrics` and the exported stream are the same data by
construction.

Example (a scoped scrape):

```bash
curl -s localhost:8080/metrics
# TYPE http.server.request.duration_count counter
# HELP http.server.request.duration_count A histogram of the server-request durations.
http.server.request.duration_count{http.request.method="GET",http.response.status_code=200} 42
# TYPE http.server.request.duration_sum gauge
http.server.request.duration_sum{http.request.method="GET",http.response.status_code=200} 1.53
```

## 3. `/health` — groups and components

`/health` keeps its aggregate document: `{ status, components, timestamp }`
(`503` when the aggregate is `DOWN`, `200` otherwise). AD-76 adds:

- **Groups** — `management.health.groups.<name>.include` lists the component
  names to aggregate. A group is served at `/health/<group>` with the same
  shape and status rules as the root document; a group with no registered
  members answers `404`. Example:

    ```json
    "management": { "health": { "groups": { "core": { "include": ["telemetry"] } } } }
    ```

- **Components** — `/health/<name>` serves one registered component as a
  one-component aggregate (`{ status, components, timestamp }`); unknown
  names answer `404`. A configured group shadows a same-named component.

## 4. `/loggers` — level inspection and live changes

Payloads follow the Spring Boot actuator endpoint:

- `GET /loggers` → `{ levels, loggers }` where `levels` is the canonical
  vocabulary (`trace`, `debug`, `info`, `warn`, `error`, `fatal`, `off`) and
  each known logger is `{ configuredLevel?, effectiveLevel }`.
- `GET /loggers/<name>` → the same document for one logger; `404` for names
  the framework has never used.
- `POST /loggers/<name>` with `{"configuredLevel": "warn"}` sets a per-name
  threshold; `{}` clears it back to the global settings floor. Unknown level
  names are rejected by the body schema (`422` — the dispatcher's
  validation status, not Spring's `400`).

Levels are **runtime, process-local state**: they apply to every handle for
the name (including ones handed out before the change), survive global
threshold changes until cleared, and are lost on restart — no persistence.

## 5. `/env` — property sources

`GET /env` → `{ activeProfiles, propertySources }`, sources in precedence
order with their flattened dotted keys:

```json
{
    "propertySources": [
        {
            "name": "application",
            "properties": { "server.port": { "value": "<redacted>", "origin": "application" } }
        }
    ]
}
```

- **Values are redacted by default** (`"<redacted>"`). Set
  `management.endpoints.env.showValues: true` to emit the **raw stored
  config text** — the endpoint never resolves placeholders and never
  decrypts, so a `{cipher:...}` marker is shown as the marker and decrypted
  plaintext can never reach the wire.
- `?toMatch=<term>` filters to sources whose name contains the term plus
  properties whose key starts with it.

## 6. `/configprops` — declared configuration, never values

`GET /configprops` → `{ beans: [{ name, properties: [{ key, type? }] }] }`
for the `@configurationProperties` classes the app hands over:

```ts
new ManagementAutoConfiguration({
    configurationClasses: [ServerConfig, SecretsConfig],
});
```

The endpoint emits declared keys and conversion types only — **values are
never read**, the same value-free contract `@blue/inspect` codifies, so a
secret cannot leak by construction. Bean names come from the shared key
prefix (`ROOT` for prefix-less classes).

## 7. Reference

- ADR: [AD-76 — Actuator parity](../decisions/2026-10-08_AD76_ACTUATOR_PARITY.md);
  [AD-77 — Prometheus metrics, semconv duration, meter-derived `/metrics`](../decisions/2026-10-08_AD77_PROMETHEUS_METRICS.md);
  AD-36 for the open-by-default + guard + firewall posture.
- Schema section: `management` in
  [`@blue/boot`'s `application.schema.json`](../../packages/blue-boot/schema/application.schema.json)
  (only `redactHealthErrors` is not read from config files); the
  `telemetry.metricExporter` spec documents the `'prometheus'` literal.
- Related: guide 10 (telemetry — the metrics backing and the exporter
  knobs), guide 13 (OpenAPI — the same management guard pattern in
  `OpenAPIDocsAutoConfiguration`), guide 03 (the config-file convention the
  `management.*` keys follow).
