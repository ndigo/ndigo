[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / getCountedConfig

# Variable: getCountedConfig

> `const` **getCountedConfig**: (`target`, `propertyKey`) => \{ `name`: `string`; `attributes?`: `Attributes`; `featureAggregator?`: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md); `featureKey?`: `string`; \} \| `undefined` = `getCounted`

Defined in: [packages/blue-telemetry/src/metrics/decorators.ts:152](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/decorators.ts#lines-152)

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
