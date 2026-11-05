[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-mapping](../README.md) / ViewMapping

# Interface: ViewMapping

Resolves a route to the view target that should handle it.

## Methods

### getTarget()

> **getTarget**(`route`): `unknown`

Returns the target associated with the given route.

#### Parameters

##### route

[`Route`](#)

The route being resolved.

#### Returns

`unknown`

The resolved target, or `null` when no target matches.
