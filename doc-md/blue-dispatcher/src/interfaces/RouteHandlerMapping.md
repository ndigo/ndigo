[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerMapping

# Interface: RouteHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:41

Resolves a route to a handler execution chain.

## Extended by

- [`MatchableHandlerMapping`](MatchableHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:48

Resolve the handler for a route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain for the chosen handler, or `null`.
