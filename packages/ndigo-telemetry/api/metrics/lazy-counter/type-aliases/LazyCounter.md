[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/lazy-counter](../README.md) / LazyCounter

# Type Alias: LazyCounter

> **LazyCounter** = (`name`, `attributes?`, `value?`) => `void`

A counter handle keyed by metric name: creates the instrument on first use
and records `value` (default `1`) against it thereafter.

## Parameters

### name

`string`

### attributes?

`Attributes`

### value?

`number`

## Returns

`void`
