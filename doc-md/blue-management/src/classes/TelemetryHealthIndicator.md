[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / TelemetryHealthIndicator

# Class: TelemetryHealthIndicator

Defined in: packages/blue-management/src/telemetry-health-indicator.ts:18

A [HealthIndicator](../interfaces/HealthIndicator.md) reporting the health of the telemetry/metrics
pipeline.

Reports `UP` when a FeatureMetricAggregator is present (metrics are
being collected); details include the number of features tracked. Reports
`DOWN` when none is wired (management endpoints would serve empty metrics).

## Since

1.0.0

## Implements

- [`HealthIndicator`](../interfaces/HealthIndicator.md)

## Constructors

### Constructor

> **new TelemetryHealthIndicator**(`aggregator`): `TelemetryHealthIndicator`

Defined in: packages/blue-management/src/telemetry-health-indicator.ts:26

#### Parameters

##### aggregator

`FeatureMetricAggregator` \| `undefined`

The shared feature-metric aggregator (may be
  `undefined` when the app has not wired one — reported `DOWN`).

#### Returns

`TelemetryHealthIndicator`

## Properties

### name

> `readonly` **name**: `"telemetry"` = `'telemetry'`

Defined in: packages/blue-management/src/telemetry-health-indicator.ts:19

The stable name of the subsystem (e.g. `'telemetry'`).

#### Implementation of

[`HealthIndicator`](../interfaces/HealthIndicator.md).[`name`](../interfaces/HealthIndicator.md#name)

## Methods

### check()

> **check**(): [`HealthResult`](../interfaces/HealthResult.md)

Defined in: packages/blue-management/src/telemetry-health-indicator.ts:31

Checks the subsystem health.

#### Returns

[`HealthResult`](../interfaces/HealthResult.md)

A promise resolving to the health result.

#### Implementation of

[`HealthIndicator`](../interfaces/HealthIndicator.md).[`check`](../interfaces/HealthIndicator.md#check)
