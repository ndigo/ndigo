[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [abstract-handler-mapping](../README.md) / RouteHandlerMapping

# Interface: RouteHandlerMapping

Resolves a route to a handler execution chain.

## Extended by

- [`MatchableHandlerMapping`](MatchableHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): [`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

Resolve the handler for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

The execution chain for the chosen handler, or `null`.
