[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / createLazyHistogram

# Function: createLazyHistogram()

> **createLazyHistogram**(`options?`): [`LazyHistogram`](../type-aliases/LazyHistogram.md)

Creates a [LazyHistogram](../type-aliases/LazyHistogram.md) with per-instrument options: the semconv
unit/description and the advice bucket boundaries applied to every
instrument the handle creates. The SDK's default aggregation turns
`HISTOGRAM` instruments with `advice.explicitBucketBoundaries` into an
explicit-bucket histogram — the aggregation the Prometheus exporter and
the `/metrics` histogram projection consume.

## Parameters

### options?

[`LazyHistogramOptions`](../interfaces/LazyHistogramOptions.md) = `{}`

The instrument options applied per created histogram.

## Returns

[`LazyHistogram`](../type-aliases/LazyHistogram.md)

A histogram handle that resolves instruments lazily.
