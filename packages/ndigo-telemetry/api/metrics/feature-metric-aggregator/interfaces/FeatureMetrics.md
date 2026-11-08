[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/feature-metric-aggregator](../README.md) / FeatureMetrics

# Interface: FeatureMetrics

Represents a collection of metrics for a specific feature.

## Properties

### counters

> `readonly` **counters**: `ReadonlyMap`\<`string`, `number`\>

Counter totals by name.

***

### durations

> `readonly` **durations**: `ReadonlyMap`\<`string`, [`DurationSummary`](DurationSummary.md)\>

Duration summaries by name.

***

### feature

> `readonly` **feature**: `string`

The feature name.

***

### gauges

> `readonly` **gauges**: `ReadonlyMap`\<`string`, `number`\>

Gauge values by name.

***

### updatedAt

> `readonly` **updatedAt**: `Date`

Last update time.
