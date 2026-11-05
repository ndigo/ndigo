[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [telemetry-health-indicator](../README.md) / TelemetryHealthIndicator

# Class: TelemetryHealthIndicator

A [HealthIndicator](../../health/interfaces/HealthIndicator.md) reporting the health of the telemetry/metrics
pipeline.

Reports `UP` when a [FeatureMetricAggregator](#) is present (metrics are
being collected); details include the number of features tracked. Reports
`DOWN` when none is wired (management endpoints would serve empty metrics).

## Since

1.0.0

## Implements

- [`HealthIndicator`](../../health/interfaces/HealthIndicator.md)

## Constructors

### Constructor

> **new TelemetryHealthIndicator**(`aggregator`): `TelemetryHealthIndicator`

#### Parameters

##### aggregator

[`FeatureMetricAggregator`](#) \| `undefined`

The shared feature-metric aggregator (may be
  `undefined` when the app has not wired one — reported `DOWN`).

#### Returns

`TelemetryHealthIndicator`

## Properties

### name

> `readonly` **name**: `"telemetry"` = `'telemetry'`

The stable name of the subsystem (e.g. `'telemetry'`).

#### Implementation of

[`HealthIndicator`](../../health/interfaces/HealthIndicator.md).[`name`](../../health/interfaces/HealthIndicator.md#name)

## Methods

### check()

> **check**(): [`HealthResult`](../../health/interfaces/HealthResult.md)

Checks the subsystem health.

#### Returns

[`HealthResult`](../../health/interfaces/HealthResult.md)

A promise resolving to the health result.

#### Implementation of

[`HealthIndicator`](../../health/interfaces/HealthIndicator.md).[`check`](../../health/interfaces/HealthIndicator.md#check)
