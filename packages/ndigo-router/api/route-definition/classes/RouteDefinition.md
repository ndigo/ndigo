[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route-definition](../README.md) / RouteDefinition

# Class: RouteDefinition\<TPattern\>

A route pattern bound to its registry: `url()` interpolates parameters into
an absolute path, `href()` into a fragment link, and both reject a missing or
unknown parameter instead of emitting a broken URL.

## Type Parameters

### TPattern

`TPattern` *extends* `string` = `string`

## Implements

- [`Matchable`](#)\<`string`\>

## Constructors

### Constructor

> **new RouteDefinition**\<`TPattern`\>(`pattern`, `context`): `RouteDefinition`\<`TPattern`\>

#### Parameters

##### pattern

`TPattern`

##### context

`Registry`

#### Returns

`RouteDefinition`\<`TPattern`\>

## Properties

### pattern

> `readonly` **pattern**: `TPattern`

The route pattern this definition is bound to.

## Methods

### href()

> **href**(`params?`): `string`

Interpolates parameters into a fragment link.

#### Parameters

##### params?

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

The path parameters.

#### Returns

`string`

The fragment href.

***

### matches()

> **matches**(`path`): `boolean`

Whether a path matches this definition.

#### Parameters

##### path

`string`

The path to test.

#### Returns

`boolean`

Whether the path matches.

#### Implementation of

`Matchable.matches`

***

### navigate()

> **navigate**(`params`): `void`

Navigates the registered router to the interpolated path.

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

The path parameters.

#### Returns

`void`

Nothing; navigation is fire-and-forget.

***

### parse()

> **parse**(`path`): [`Route`](../../route/interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

Parses a path against this definition.

#### Parameters

##### path

`string`

The path to parse.

#### Returns

[`Route`](../../route/interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

The bound route, or `null` when it does not match.

***

### url()

> **url**(`params`): `string`

Interpolates parameters into an absolute path.

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

The path parameters.

#### Returns

`string`

The absolute path.
