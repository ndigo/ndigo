[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/lazy-counter](../README.md) / createLazyCounter

# Function: createLazyCounter()

> **createLazyCounter**(): [`LazyCounter`](../type-aliases/LazyCounter.md)

Creates a [LazyCounter](../type-aliases/LazyCounter.md). Each call resolves the named instrument
against the *current* global meter the first time that name is seen — the
meter provider registered by the time the first datapoint is recorded.

## Returns

[`LazyCounter`](../type-aliases/LazyCounter.md)

A counter handle that resolves instruments lazily.
