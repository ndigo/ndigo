[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / FeatureMetricRecorder

# Interface: FeatureMetricRecorder

Defined in: [packages/blue-core/src/feature-metric-recorder.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/feature-metric-recorder.ts#lines-8)

Contract for recording feature-level metrics.

## Methods

### incrementCounter()

> **incrementCounter**(`feature`, `metricName`, `value?`): `void`

Defined in: [packages/blue-core/src/feature-metric-recorder.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/feature-metric-recorder.ts#lines-15)

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

Defined in: [packages/blue-core/src/feature-metric-recorder.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/feature-metric-recorder.ts#lines-22)

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

Defined in: [packages/blue-core/src/feature-metric-recorder.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/feature-metric-recorder.ts#lines-29)

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
