[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-json](../README.md) / MetricJSONEntry

# Interface: MetricJSONEntry

The JSON form of one snapshot.

## Properties

### description?

> `readonly` `optional` **description?**: `string`

Optional metric description.

***

### points

> `readonly` **points**: readonly [`MetricJSONPoint`](MetricJSONPoint.md)[]

The aggregated points.

***

### type

> `readonly` **type**: `"sum"` \| `"gauge"` \| `"histogram"`

The metric type.

***

### unit

> `readonly` **unit**: `string`

The metric unit.
