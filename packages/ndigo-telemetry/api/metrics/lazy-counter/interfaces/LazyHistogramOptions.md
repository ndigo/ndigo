[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/lazy-counter](../README.md) / LazyHistogramOptions

# Interface: LazyHistogramOptions

Options for [createLazyHistogram](../functions/createLazyHistogram.md) — applied to every instrument the
returned handle creates.

## Properties

### boundaries?

> `optional` **boundaries?**: readonly `number`[]

Explicit bucket boundaries in the value's unit, honored by the SDK's
default aggregation for `HISTOGRAM` instruments.

***

### description?

> `optional` **description?**: `string`

The metric description (semconv description text).

***

### unit?

> `optional` **unit?**: `string`

The unit of the recorded values (semconv units, e.g. `s`).
