[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatchableHandlerMapping

# Interface: MatchableHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:54

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`RouteHandlerMapping`](RouteHandlerMapping.md)

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

#### Inherited from

[`RouteHandlerMapping`](RouteHandlerMapping.md).[`getHandler`](RouteHandlerMapping.md#gethandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../classes/RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:62

Check whether the route matches a pattern.

#### Parameters

##### route

`Route`

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../classes/RouteMatchResult.md)

A match result, or `null`.
