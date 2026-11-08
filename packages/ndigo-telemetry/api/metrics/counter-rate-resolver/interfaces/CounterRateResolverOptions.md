[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/counter-rate-resolver](../README.md) / CounterRateResolverOptions

# Interface: CounterRateResolverOptions

Options for configuring the `CounterRateResolver`.

## Properties

### aggregator

> `readonly` **aggregator**: [`FeatureMetricAggregator`](../../feature-metric-aggregator/classes/FeatureMetricAggregator.md)

The aggregator whose counters are sampled.

***

### thresholds?

> `readonly` `optional` **thresholds?**: `ReadonlyMap`\<`string`, `number`\>

Per-counter alert thresholds.

***

### windowSize?

> `readonly` `optional` **windowSize?**: `number`

Sampling window size in entries.
