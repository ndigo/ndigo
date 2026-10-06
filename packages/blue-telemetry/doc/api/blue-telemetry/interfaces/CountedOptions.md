[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / CountedOptions

# Interface: CountedOptions

Options for the `counted` decorator.

## Properties

### attributes?

> `optional` **attributes?**: `Attributes`

Optional attributes to associate with the counter.

***

### featureAggregator?

> `optional` **featureAggregator?**: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md)

An optional feature metric aggregator to increment a feature-specific counter.

***

### featureKey?

> `optional` **featureKey?**: `string`

The key within the attributes to use for feature aggregation. Defaults to 'feature'.

***

### name?

> `optional` **name?**: `string`

The name of the counter. If not provided, the method's name will be used with a `.count` suffix.
