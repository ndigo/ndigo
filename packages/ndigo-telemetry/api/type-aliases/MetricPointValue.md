[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / MetricPointValue

# Type Alias: MetricPointValue

> **MetricPointValue** = \{ `kind`: `"scalar"`; `value`: `number`; \} \| \{ `buckets`: readonly [`MetricHistogramBucket`](../interfaces/MetricHistogramBucket.md)[]; `count`: `number`; `kind`: `"histogram"`; `max`: `number` \| `undefined`; `min`: `number` \| `undefined`; `sum`: `number` \| `undefined`; \}

The aggregated value of one metric point.
