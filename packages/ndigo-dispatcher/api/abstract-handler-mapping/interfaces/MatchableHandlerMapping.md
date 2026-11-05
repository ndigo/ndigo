[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [abstract-handler-mapping](../README.md) / MatchableHandlerMapping

# Interface: MatchableHandlerMapping

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`RouteHandlerMapping`](RouteHandlerMapping.md)

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

#### Inherited from

[`RouteHandlerMapping`](RouteHandlerMapping.md).[`getHandler`](RouteHandlerMapping.md#gethandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

Check whether the route matches a pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

A match result, or `null`.
