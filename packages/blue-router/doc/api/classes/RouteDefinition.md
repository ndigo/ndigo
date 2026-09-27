[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / RouteDefinition

# Class: RouteDefinition\<TPattern\>

## Type Parameters

### TPattern

`TPattern` *extends* `string` = `string`

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

#### Parameters

##### path

`string`

#### Returns

`boolean`

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

> **parse**(`path`): [`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

#### Parameters

##### path

`string`

#### Returns

[`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

***

### url()

> **url**(`params`): `string`

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`
