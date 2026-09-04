[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatchableHandlerMapping

# Interface: MatchableHandlerMapping

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:39

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`RouteHandlerMapping`](RouteHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:33

Resolve the handler for a route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain for the chosen handler, or `null`.

#### Inherited from

[`RouteHandlerMapping`](RouteHandlerMapping.md).[`getHandler`](RouteHandlerMapping.md#gethandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../classes/RouteMatchResult.md) \| `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:47

Check whether the route matches a pattern.

#### Parameters

##### route

`Route`

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../classes/RouteMatchResult.md) \| `null`

A match result, or `null`.
