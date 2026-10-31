[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / scheduleFromSpec

# Function: scheduleFromSpec()

> **scheduleFromSpec**(`spec`): [`Schedule`](../interfaces/Schedule.md)

Builds the [Schedule](../interfaces/Schedule.md) for a normalized schedule spec.

## Parameters

### spec

[`NormalizedScheduledSpec`](../interfaces/NormalizedScheduledSpec.md)

The normalized spec produced by `@scheduled`.

## Returns

[`Schedule`](../interfaces/Schedule.md)

The schedule implementation for the spec's trigger.

## Throws

When the spec has no trigger — it should have
  been rejected at decoration time; this is defense in depth.
