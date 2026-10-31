# @blue/management

> Actuator-style management endpoints for Blue Node applications: `/health` (the aggregate component health report) and `/metrics` (the meter snapshot — Prometheus text exposition by default, JSON projection on an explicit `Accept: application/json`). It complements `@blue/telemetry`: telemetry _produces_ metric data (OTel instruments, `@counted`); management _serves_ it as HTTP.

Actuator-style management endpoints for Blue Node applications: `/health` (the aggregate component health report) and `/metrics` (the meter snapshot — Prometheus text exposition by default, JSON projection on an explicit `Accept: application/json`). It complements `@blue/telemetry`: telemetry _produces_ metric data (OTel instruments, `@counted`); management _serves_ it as HTTP.

## Installation

```bash
pnpm add @blue/management
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
// node app bootstrap
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';

// NodeAutoConfiguration is auto-registered by @blue/boot on Node.
const app = new ApplicationBuilder([ManagementAutoConfiguration]).run();
```

## Usage

- `GET /health` → `{ status, components, timestamp }` at `200` when the aggregate is `UP`/`UNKNOWN`, and at **`503 Service Unavailable` when any component is `DOWN`** (the status code tracks the aggregate, so orchestrator probes can route on it alone; the body shape is identical either way)
- `GET /metrics` → the **meter snapshot** (AD-77): the Prometheus text exposition document by default (`text/plain; version=0.0.4` — the scraper contract), or the JSON projection `{ metrics: { <name>: { type, unit, description?, points } } }` on an explicit `Accept: application/json`. The auto-configuration's feature aggregator backs the endpoint as the fallback snapshot source when no telemetry pull reader is registered (REV-003) — feature counters/gauges/durations render as `{feature}.{name}` snapshots; with neither source present: `{ "error": "No metric source wired" }` (see guide 26 §2)

> **⚠️ Open by default.** These endpoints carry no authentication: **any caller that can reach the port can read them.** On an untrusted network, pass an _unconditional_ guard to `ManagementAutoConfiguration({ accessGuard })` so every management request is denied before its handler runs — a guard that checks the request itself (a token-presence or token-adapter guard), because the handlers carry no `@authenticated`/`@authorized` metadata and a metadata-driven guard such as `AuthRouteGuard` would always permit them. Also firewall the management routes at the network boundary. Indicator error messages are surfaced in `/health` responses — guard or firewall when they may reveal sensitive subsystem details.

### How it works

- `ManagementAutoConfiguration` registers a shared `FeatureMetricAggregator` entry (the same one `@counted` and feature code populate, and `TelemetryHealthIndicator` reads), a `HealthRegistry` pre-wired with the telemetry indicator, and the two controllers.
- When `accessGuard` is configured, a `handlerMappings` entry attaches the guard to the dispatch interceptor chain, scoped to management paths only — `/health` and `/metrics` are denied before their handlers run while every other route is untouched.
- The mapping prepends `SecurityHeadersInterceptor` — management responses carry the platform's default security-header set (CSP, `X-Content-Type-Options: nosniff`, …) even though these routes bypass the platform mapping.
- `MetricsController` (`/metrics`) reads the process's registered metric snapshot source (AD-77 D-3) — registered by `@blue/telemetry-node`'s `configureTelemetry({ metricExporter: 'prometheus' })`, replacing the aggregator as the endpoint's backing — and renders the snapshot as Prometheus text or the JSON projection.
- `HealthController` (`/health`) runs the context `HealthRegistry` — the registry is wired once at context refresh and never mutated per request. The response status mirrors the aggregate: `503` when a component is `DOWN`, `200` otherwise (the health document is written by a producing view so it survives at `503`, where a `ResponseEntity` would be re-shaped into a `problem+json` error body).
- Custom `HealthIndicator`s can be registered on the `HealthRegistry` entry for other subsystems (data sources, external deps).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

- `HealthRegistry` — `register/unregister/checkAll`; `HealthIndicator` interface.
- `TelemetryHealthIndicator` — reports telemetry health from the aggregator.
- `MetricsController` / `HealthController` — the two endpoints.
- `METRIC_AGGREGATOR` / `HEALTH_REGISTRY` — context tokens for the shared beans.

`HealthRegistry` implements `Enumerable<string, HealthIndicator>`: `entries`,
`keys`, `values`, and `forEach` enumerate registrations in order without exposing
the backing map. Replacements keep their position; `names` remains a frozen
snapshot. Enumeration does not change concurrent health-check execution.

## Development

```bash
pnpm --filter @blue/management build:lib
pnpm --filter @blue/management test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — produces the telemetry counters management serves
- [@blue/platform-node](../blue-platform-node/README.md) — `SecurityHeadersInterceptor`, attached to management responses by default

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
