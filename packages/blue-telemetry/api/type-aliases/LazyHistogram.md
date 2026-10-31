[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / LazyHistogram

# Type Alias: LazyHistogram

> **LazyHistogram** = (`name`, `attributes?`, `value?`) => `void`

A histogram handle keyed by metric name: creates the instrument on first
use and records `value` (default `1`) against it thereafter.

## Parameters

### name

`string`

### attributes?

`Attributes`

### value?

`number`

## Returns

`void`
