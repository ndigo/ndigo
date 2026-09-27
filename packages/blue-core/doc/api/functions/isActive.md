[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / isActive

# Function: isActive()

> **isActive**(`target`, `ctx?`): `boolean`

Evaluates ALL conditions on a class (platform, property, missing-entry).

When a [ConditionContext](../interfaces/ConditionContext.md) is provided, property and missing-entry
conditions are evaluated against it; without one, only the platform
condition is checked (property/missing-entry conditions are treated as
active so existing callers keep working).

## Parameters

### target

`unknown`

The class constructor or instance to check.

### ctx?

[`ConditionContext`](../interfaces/ConditionContext.md)

Optional context for property/entry conditions.

## Returns

`boolean`

`true` when all conditions pass.
