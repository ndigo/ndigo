[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / MetricJSONPoint

# Interface: MetricJSONPoint

The JSON form of one aggregated point.

## Properties

### attributes

> `readonly` **attributes**: `Record`\<`string`, `AttributeValue`\>

***

### histogram?

> `readonly` `optional` **histogram?**: `object`

The histogram statistics — present for `histogram` snapshots.

#### buckets

> `readonly` **buckets**: readonly [`MetricHistogramBucket`](MetricHistogramBucket.md)[]

#### count

> `readonly` **count**: `number`

#### max?

> `readonly` `optional` **max?**: `number`

#### min?

> `readonly` `optional` **min?**: `number`

#### sum?

> `readonly` `optional` **sum?**: `number`

***

### value?

> `readonly` `optional` **value?**: `number`

The aggregated value — present for `sum`/`gauge` snapshots.
