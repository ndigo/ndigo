[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / ManagementAutoConfiguration

# Class: ManagementAutoConfiguration

Auto-configuration for management endpoints.

Registers:
- a shared [FeatureMetricAggregator](#) entry (read by `/metrics` and by
  any feature using `counted`)
- a [HealthRegistry](HealthRegistry.md) with the [TelemetryHealthIndicator](TelemetryHealthIndicator.md) wired
- the `/metrics` and `/health` controllers

Register alongside `NodeAutoConfiguration` in a Node application:

```ts
const app = new ApplicationBuilder([NodeAutoConfiguration, ManagementAutoConfiguration]);
```

The endpoints are **open by default** — on an untrusted network, pass an
*unconditional* guard (a token-presence / token-adapter
`RouteHandlerInterceptor`; metadata-driven guards like the auth-server's
`AuthRouteGuard` cannot protect these handlers, which carry no
`@authenticated`/`@authorized` metadata) to
`ManagementAutoConfiguration(options)` so `/metrics` and `/health`
require authentication, and/or firewall the management routes at the
network boundary.

## Since

1.0.0

## Constructors

### Constructor

> **new ManagementAutoConfiguration**(`options?`): `ManagementAutoConfiguration`

#### Parameters

##### options?

[`ManagementAutoConfigurationOptions`](#) = `{}`

#### Returns

`ManagementAutoConfiguration`

## Methods

### handlerMappings()

> **handlerMappings**(): `RadixMetadataHandlerMapping`[]

The metadata handler mapping(s): the default security-header set is
prepended (same instance shape as the platform mapping — `/health` and
`/metrics` otherwise bypass the interceptor attached to the *platform*
mapping), then the configured access guard pushed onto the interceptor
chain when present. Declared as the `handlerMappings` collection (the
resolution the strategy checks first), so it is immune to
registration-order clobbering by `NodeAutoConfiguration.handlerMapping`;
controllers still register through it via handler detection. Without a
guard the mapping behaves like the platform default plus headers.

#### Returns

`RadixMetadataHandlerMapping`[]

The metadata mapping (security headers default-on, guard-attached when configured).

***

### healthController()

> **healthController**(): [`HealthController`](HealthController.md)

Serves `/health`.

#### Returns

[`HealthController`](HealthController.md)

The health controller.

***

### healthRegistry()

> **healthRegistry**(): [`HealthRegistry`](HealthRegistry.md)

The health registry, pre-wired with the telemetry indicator (which
reads the shared aggregator at check time). Registered once at context
refresh — never mutated per request.

#### Returns

[`HealthRegistry`](HealthRegistry.md)

The registry.

***

### metricAggregator()

> **metricAggregator**(): [`FeatureMetricAggregator`](#)

The shared feature-metric aggregator backing `/metrics`.

#### Returns

[`FeatureMetricAggregator`](#)

The shared aggregator.

***

### metricsController()

> **metricsController**(): [`MetricsController`](MetricsController.md)

Serves `/metrics` (the guard from options applies at the dispatch
level, see [ManagementAutoConfiguration.handlerMappings](#handlermappings)).

#### Returns

[`MetricsController`](MetricsController.md)

The metrics controller.
