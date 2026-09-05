# @blue/management

Actuator-style management endpoints for Blue Node applications: **`/health`**
(liveness/readiness) and **`/metrics`** (live telemetry counters).

Complements `@blue/telemetry`: telemetry *produces* metric data
(`FeatureMetricAggregator`, `@counted`); management *serves* it as HTTP.

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

## How it works

- `ManagementAutoConfiguration` registers a shared `FeatureMetricAggregator`
  bean (the same one `@counted` and feature code populate), a `HealthRegistry`,
  and the two controllers.
- `MetricsController` (`/metrics`) reads the aggregator from the application
  context and serializes per-feature counters/gauges.
- `HealthController` (`/health`) runs a `HealthRegistry` plus a
  `TelemetryHealthIndicator` built at request time from the context aggregator
  (reports `UP` when the telemetry pipeline is collecting, `DOWN` otherwise).
- Custom `HealthIndicator`s can be registered on the `HealthRegistry` bean for
  other subsystems (data sources, external deps).

## API

- `HealthRegistry` — `register/unregister/checkAll`; `HealthIndicator` interface.
- `TelemetryHealthIndicator` — reports telemetry health from the aggregator.
- `MetricsController` / `HealthController` — the two endpoints.
- `METRIC_AGGREGATOR` / `HEALTH_REGISTRY` — context tokens for the shared beans.