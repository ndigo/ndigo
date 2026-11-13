[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-target](../README.md) / likeViewTarget

# Function: likeViewTarget()

> **likeViewTarget**(`value`): `value is ViewTarget`

Tests whether a value behaves like a [ViewTarget](../interfaces/ViewTarget.md).

Runtime-supplied targets (a result's explicit target, a route attribute set
by an interceptor) cross a boundary the type system does not police, so the
dispatcher validates them before a view writes into them. A string is the
dangerous near-miss: it would otherwise reach a selector lookup.

## Parameters

### value

`unknown`

The value to inspect.

## Returns

`value is ViewTarget`

`true` when the value is target-shaped.
