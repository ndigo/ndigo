[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MatchableHandlerMapping

# Interface: MatchableHandlerMapping

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`RouteHandlerMapping`](RouteHandlerMapping.md)

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

#### Inherited from

[`RouteHandlerMapping`](RouteHandlerMapping.md).[`getHandler`](RouteHandlerMapping.md#gethandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../classes/RouteMatchResult.md) \| `null`

Check whether the route matches a pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../classes/RouteMatchResult.md) \| `null`

A match result, or `null`.
