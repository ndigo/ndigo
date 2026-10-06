[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / CountedMethodConfig

# Interface: CountedMethodConfig

The configuration recorded for a method decorated with `counted`: the
counter name, attributes, and optional feature aggregation.

## Properties

### attributes?

> `optional` **attributes?**: `Attributes`

Attributes associated with the counter.

***

### featureAggregator?

> `optional` **featureAggregator?**: [`FeatureMetricAggregator`](../classes/FeatureMetricAggregator.md)

Optional aggregator for feature-scoped counters.

***

### featureKey?

> `optional` **featureKey?**: `string`

The attribute key holding the feature (defaults to 'feature').

***

### name

> **name**: `string`

The counter name (defaults to `<method>.count`).
