[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / getCounted

# Function: getCounted()

> **getCounted**(`target`, `propertyKey`): \{ `name`: `string`; `attributes?`: `Attributes`; `featureAggregator?`: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md); `featureKey?`: `string`; \} \| `undefined`

Defined in: [packages/blue-telemetry/src/metrics/decorators.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/decorators.ts#lines-15)

Retrieves the configuration for a counted method, including its name and attributes.

## Parameters

### target

`any`

The target object or prototype.

### propertyKey

`string` \| `symbol`

The name of the method.

## Returns

\{ `name`: `string`; `attributes?`: `Attributes`; `featureAggregator?`: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md); `featureKey?`: `string`; \} \| `undefined`

An object containing the counter name and optional attributes if the method is counted, otherwise `undefined`.
