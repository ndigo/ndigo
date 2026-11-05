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

## Methods

### href()

> **href**(`params?`): `string`

#### Parameters

##### params?

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`

***

### matches()

> **matches**(`path`): `boolean`

Determines if this object matches the specified value.

#### Parameters

##### path

`string`

#### Returns

`boolean`

`true` if the object matches the value, `false` otherwise.

#### Implementation of

`Matchable.matches`

***

### navigate()

> **navigate**(`params`): `void`

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`void`

***

### parse()

> **parse**(`path`): [`Route`](../../route/interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

#### Parameters

##### path

`string`

#### Returns

[`Route`](../../route/interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

***

### url()

> **url**(`params`): `string`

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`
