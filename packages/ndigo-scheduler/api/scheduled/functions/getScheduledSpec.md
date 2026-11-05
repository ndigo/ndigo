[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [scheduled](../README.md) / getScheduledSpec

# Function: getScheduledSpec()

> **getScheduledSpec**(`target`, `methodName`): [`NormalizedScheduledSpec`](../../spec/interfaces/NormalizedScheduledSpec.md) \| `undefined`

Reads the schedule recorded by `@scheduled` for a method.

## Parameters

### target

`object`

The decorated class constructor.

### methodName

`string`

The decorated method name.

## Returns

[`NormalizedScheduledSpec`](../../spec/interfaces/NormalizedScheduledSpec.md) \| `undefined`

The normalized schedule, or `undefined` when not scheduled.
