[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-snapshot](../README.md) / MetricSnapshot

# Interface: MetricSnapshot

The aggregated shape of one metric instrument at one collection. The
`type` mirrors the OTel aggregation kind (`sum` — counters and
up-down-counters; `gauge`; `histogram`).

## Properties

### description

> `readonly` **description**: `string`

The metric description.

***

### name

> `readonly` **name**: `string`

The metric name.

***

### points

> `readonly` **points**: readonly [`MetricPoint`](MetricPoint.md)[]

The aggregated points.

***

### type

> `readonly` **type**: `"sum"` \| `"gauge"` \| `"histogram"`

The aggregation kind.

***

### unit

> `readonly` **unit**: `string`

The metric unit.
