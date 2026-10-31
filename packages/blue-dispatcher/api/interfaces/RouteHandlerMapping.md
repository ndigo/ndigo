[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteHandlerMapping

# Interface: RouteHandlerMapping

Resolves a route to a handler execution chain.

## Extended by

- [`MatchableHandlerMapping`](MatchableHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): [`RouteHandlerExecutionChain`](#) \| `null`

Resolve the handler for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerExecutionChain`](#) \| `null`

The execution chain for the chosen handler, or `null`.
