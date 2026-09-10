# @blue/management

Actuator-style management endpoints for Blue Node applications: **`/health`**
(liveness/readiness) and **`/metrics`** (live telemetry counters).

Complements `@blue/telemetry`: telemetry _produces_ metric data
(`FeatureMetricAggregator`, `@counted`); management _serves_ it as HTTP.

## Usage

```ts
// node app bootstrap
import { ApplicationBuilder } from '@blue/boot';
import { ManagementAutoConfiguration } from '@blue/management';

// NodeAutoConfiguration is auto-registered by @blue/boot on Node.
const app = new ApplicationBuilder([ManagementAutoConfiguration]).run();
```

- `GET /health` → `{ status, components, timestamp }`
- `GET /metrics` → `{ features: { <feature>: { counters, gauges, updatedAt } } }`

> **⚠️ Open by default.** These endpoints carry no authentication: **any
> caller that can reach the port can read them.** On an untrusted network,
> pass an access guard to `ManagementAutoConfiguration({ accessGuard })`
> (any `RouteHandlerInterceptor` — e.g. the `AuthRouteGuard` from
> `@blue/auth-server`) so every management request is denied before its
> handler runs, and/or firewall the management routes at the network
> boundary. Indicator error messages are surfaced in `/health` responses —
> guard or firewall when they may reveal sensitive subsystem details.

## How it works

- `ManagementAutoConfiguration` registers a shared `FeatureMetricAggregator`
  entry (the same one `@counted` and feature code populate), a `HealthRegistry`
  pre-wired with a `TelemetryHealthIndicator`, and the two controllers.
- When `accessGuard` is configured, a `handlerMappings` entry attaches the
  guard to the dispatch interceptor chain, scoped to management paths only —
  `/health` and `/metrics` are denied before their handlers run while every
  other route is untouched.
- `MetricsController` (`/metrics`) reads the aggregator from the application
  context and serializes per-feature counters/gauges.
- `HealthController` (`/health`) runs the context `HealthRegistry` — the
  registry is wired once at context refresh and never mutated per request.
- Custom `HealthIndicator`s can be registered on the `HealthRegistry` entry for
  other subsystems (data sources, external deps).

## API

- `HealthRegistry` — `register/unregister/checkAll`; `HealthIndicator` interface.
- `TelemetryHealthIndicator` — reports telemetry health from the aggregator.
- `MetricsController` / `HealthController` — the two endpoints.
- `METRIC_AGGREGATOR` / `HEALTH_REGISTRY` — context tokens for the shared beans.
