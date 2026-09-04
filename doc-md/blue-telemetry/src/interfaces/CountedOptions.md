[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / CountedOptions

# Interface: CountedOptions

Defined in: packages/blue-telemetry/src/metrics/decorators.ts:35

Options for the `@counted` decorator.

## Properties

### attributes?

> `optional` **attributes?**: `Attributes`

Defined in: packages/blue-telemetry/src/metrics/decorators.ts:39

Optional attributes to associate with the counter.

***

### featureAggregator?

> `optional` **featureAggregator?**: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md)

Defined in: packages/blue-telemetry/src/metrics/decorators.ts:43

An optional feature metric aggregator to increment a feature-specific counter.

***

### featureKey?

> `optional` **featureKey?**: `string`

Defined in: packages/blue-telemetry/src/metrics/decorators.ts:47

The key within the attributes to use for feature aggregation. Defaults to 'feature'.

***

### name?

> `optional` **name?**: `string`

Defined in: packages/blue-telemetry/src/metrics/decorators.ts:51

The name of the counter. If not provided, the method's name will be used with a `.count` suffix.
