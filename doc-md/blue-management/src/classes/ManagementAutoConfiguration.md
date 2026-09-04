[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / ManagementAutoConfiguration

# Class: ManagementAutoConfiguration

Defined in: packages/blue-management/src/management-auto-configuration.ts:29

Auto-configuration for management endpoints.

Registers:
- a shared FeatureMetricAggregator bean (read by `/metrics` and by
  any feature using `@counted`)
- a [HealthRegistry](HealthRegistry.md) with the [TelemetryHealthIndicator](TelemetryHealthIndicator.md) wired
- the `/metrics` and `/health` controllers

Register alongside `NodeAutoConfiguration` in a Node application:

```ts
const app = new ApplicationBuilder([NodeAutoConfiguration, ManagementAutoConfiguration]);
```

## Since

1.0.0

## Constructors

### Constructor

> **new ManagementAutoConfiguration**(): `ManagementAutoConfiguration`

#### Returns

`ManagementAutoConfiguration`

## Methods

### metricAggregator()

> **metricAggregator**(): `FeatureMetricAggregator`

Defined in: packages/blue-management/src/management-auto-configuration.ts:36

The shared feature-metric aggregator backing `/metrics`.

#### Returns

`FeatureMetricAggregator`

A fresh aggregator.

***

### healthRegistry()

> **healthRegistry**(): [`HealthRegistry`](HealthRegistry.md)

Defined in: packages/blue-management/src/management-auto-configuration.ts:47

The health registry. The `/health` controller adds the telemetry
indicator at request time from the context aggregator.

#### Returns

[`HealthRegistry`](HealthRegistry.md)

An empty (populated lazily) registry.

***

### metricsController()

> **metricsController**(): [`MetricsController`](MetricsController.md)

Defined in: packages/blue-management/src/management-auto-configuration.ts:57

Serves `/metrics`.

#### Returns

[`MetricsController`](MetricsController.md)

The metrics controller.

***

### healthController()

> **healthController**(): [`HealthController`](HealthController.md)

Defined in: packages/blue-management/src/management-auto-configuration.ts:67

Serves `/health`.

#### Returns

[`HealthController`](HealthController.md)

The health controller.
