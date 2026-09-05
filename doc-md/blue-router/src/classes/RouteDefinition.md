[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteDefinition

# Class: RouteDefinition\<TPattern\>

Defined in: [packages/blue-router/src/route-definition.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-20)

## Type Parameters

### TPattern

`TPattern` *extends* `string` = `string`

## Constructors

### Constructor

> **new RouteDefinition**\<`TPattern`\>(`pattern`, `context`): `RouteDefinition`\<`TPattern`\>

Defined in: [packages/blue-router/src/route-definition.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-24)

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

Defined in: [packages/blue-router/src/route-definition.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-21)

## Methods

### url()

> **url**(`params`): `string`

Defined in: [packages/blue-router/src/route-definition.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-29)

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`

***

### href()

> **href**(`params?`): `string`

Defined in: [packages/blue-router/src/route-definition.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-33)

#### Parameters

##### params?

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`string`

***

### navigate()

> **navigate**(`params`): `void`

Defined in: [packages/blue-router/src/route-definition.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-37)

#### Parameters

##### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>

#### Returns

`void`

***

### parse()

> **parse**(`path`): [`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

Defined in: [packages/blue-router/src/route-definition.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-50)

#### Parameters

##### path

`string`

#### Returns

[`Route`](../interfaces/Route.md)\<[`RouteParams`](../type-aliases/RouteParams.md)\<`TPattern`\>\> \| `null`

***

### matches()

> **matches**(`path`): `boolean`

Defined in: [packages/blue-router/src/route-definition.ts:67](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-definition.ts#lines-67)

#### Parameters

##### path

`string`

#### Returns

`boolean`
