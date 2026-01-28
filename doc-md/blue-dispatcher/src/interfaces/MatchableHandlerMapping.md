[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatchableHandlerMapping

# Interface: MatchableHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:34

## Extends

- [`RouteHandlerMapping`](RouteHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:31

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`RouteHandlerMapping`](RouteHandlerMapping.md).[`getHandler`](RouteHandlerMapping.md#gethandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../classes/RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:35

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### pattern

`string`

#### Returns

[`RouteMatchResult`](../classes/RouteMatchResult.md)
