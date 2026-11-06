[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [feature-metric-recorder](../README.md) / FeatureMetricRecorder

# Interface: FeatureMetricRecorder

Contract for recording feature-level metrics.

## Methods

### incrementCounter()

> **incrementCounter**(`feature`, `metricName`, `value?`): `void`

Increments a counter metric for a specific feature.

#### Parameters

##### feature

`string`

The name of the feature.

##### metricName

`string`

The name of the metric to increment.

##### value?

`number`

The amount to increment the counter by. Defaults to 1.

#### Returns

`void`

***

### recordDuration()?

> `optional` **recordDuration**(`feature`, `metricName`, `durationMs`): `void`

Records a duration metric for a specific feature.

#### Parameters

##### feature

`string`

The name of the feature.

##### metricName

`string`

The name of the metric to record.

##### durationMs

`number`

The duration in milliseconds.

#### Returns

`void`

***

### setGauge()?

> `optional` **setGauge**(`feature`, `metricName`, `value`): `void`

Sets a gauge metric to a specific value for a feature.

#### Parameters

##### feature

`string`

The name of the feature.

##### metricName

`string`

The name of the metric to set.

##### value

`number`

The value to set the gauge to.

#### Returns

`void`
