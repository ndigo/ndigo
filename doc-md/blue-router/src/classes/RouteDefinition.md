[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteDefinition

# Class: RouteDefinition\<TPattern\>

Defined in: packages/blue-router/src/route-definition.ts:21

## Type Parameters

### TPattern

`TPattern` *extends* `string` = `string`

## Constructors

### Constructor

> **new RouteDefinition**\<`TPattern`\>(`pattern`, `context`): `RouteDefinition`\<`TPattern`\>

Defined in: packages/blue-router/src/route-definition.ts:25

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

Defined in: packages/blue-router/src/route-definition.ts:22

## Methods

### url()

> **url**(`params`): `string`

Defined in: packages/blue-router/src/route-definition.ts:30

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`

***

### href()

> **href**(`params?`): `string`

Defined in: packages/blue-router/src/route-definition.ts:34

#### Parameters

##### params?

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`

***

### navigate()

> **navigate**(`params`): `void`

Defined in: packages/blue-router/src/route-definition.ts:38

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`void`

***

### parse()

> **parse**(`path`): [`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

Defined in: packages/blue-router/src/route-definition.ts:51

#### Parameters

##### path

`string`

#### Returns

[`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

***

### matches()

> **matches**(`path`): `boolean`

Defined in: packages/blue-router/src/route-definition.ts:68

#### Parameters

##### path

`string`

#### Returns

`boolean`
