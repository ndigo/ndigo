[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / MetricSnapshot

# Interface: MetricSnapshot

The aggregated shape of one metric instrument at one collection. The
`type` mirrors the OTel aggregation kind (`sum` — counters and
up-down-counters; `gauge`; `histogram`).

## Properties

### description

> `readonly` **description**: `string`

***

### name

> `readonly` **name**: `string`

***

### points

> `readonly` **points**: readonly [`MetricPoint`](MetricPoint.md)[]

***

### type

> `readonly` **type**: `"sum"` \| `"gauge"` \| `"histogram"`

***

### unit

> `readonly` **unit**: `string`
