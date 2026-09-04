[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / FeatureMetricAggregator

# Class: FeatureMetricAggregator

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:46

Aggregates and manages various metrics (counters, gauges, durations) for different features.

This class provides methods to increment counters, set gauge values, and record durations,
organizing them by feature. It also offers a way to retrieve summarized metrics for analysis.

## Constructors

### Constructor

> **new FeatureMetricAggregator**(`options?`): `FeatureMetricAggregator`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:55

Creates an instance of `FeatureMetricAggregator`.

#### Parameters

##### options?

[`FeatureMetricAggregatorOptions`](../interfaces/FeatureMetricAggregatorOptions.md) = `{}`

Configuration options for the aggregator.

#### Returns

`FeatureMetricAggregator`

## Accessors

### featureNames

#### Get Signature

> **get** **featureNames**(): readonly `string`[]

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:64

Returns a read-only array of all feature names currently being tracked by the aggregator.

##### Returns

readonly `string`[]

## Methods

### clear()

> **clear**(): `void`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:71

Clears all aggregated metrics for all features.

#### Returns

`void`

***

### clearFeature()

> **clearFeature**(`feature`): `boolean`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:80

Clears all aggregated metrics for a specific feature.

#### Parameters

##### feature

`string`

The name of the feature to clear.

#### Returns

`boolean`

`true` if the feature was found and cleared, `false` otherwise.

***

### getFeatureMetrics()

> **getFeatureMetrics**(`feature`): [`FeatureMetrics`](../interfaces/FeatureMetrics.md) \| `undefined`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:90

Retrieves a read-only snapshot of all metrics for a given feature.
Durations are summarized into `DurationSummary` objects.

#### Parameters

##### feature

`string`

The name of the feature to retrieve metrics for.

#### Returns

[`FeatureMetrics`](../interfaces/FeatureMetrics.md) \| `undefined`

A `FeatureMetrics` object if the feature exists, otherwise `undefined`.

***

### incrementCounter()

> **incrementCounter**(`feature`, `name`, `value?`): `number`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:114

Increments a counter for a specific feature. If the counter or feature does not exist, they will be created.

#### Parameters

##### feature

`string`

The name of the feature.

##### name

`string`

The name of the counter.

##### value?

`number` = `1`

The amount to increment the counter by. Defaults to 1. Must be a finite number.

#### Returns

`number`

The new value of the counter.

#### Throws

If the value is not a finite number or if the feature limit is reached.

***

### setGauge()

> **setGauge**(`feature`, `name`, `value`): `void`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:134

Sets the value of a gauge for a specific feature. If the gauge or feature does not exist, they will be created.

#### Parameters

##### feature

`string`

The name of the feature.

##### name

`string`

The name of the gauge.

##### value

`number`

The value to set the gauge to. Must be a finite number.

#### Returns

`void`

#### Throws

If the value is not a finite number or if the feature limit is reached.

***

### recordDuration()

> **recordDuration**(`feature`, `name`, `durationMs`): `void`

Defined in: packages/blue-telemetry/src/metrics/feature-metric-aggregator.ts:151

Records a duration in milliseconds for a specific feature.
The aggregator maintains a history of samples up to `maxDurationSamples`.

#### Parameters

##### feature

`string`

The name of the feature.

##### name

`string`

The name of the duration metric.

##### durationMs

`number`

The duration in milliseconds. Must be a non-negative finite number.

#### Returns

`void`

#### Throws

If the duration is not a finite number, is negative, or if the feature limit is reached.
