[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [router-execution-chain](../README.md) / default

# Class: default

Runs a router's interceptors around one navigation: tracks the current
interceptor index so a pre-handle outcome can short-circuit, and drives the
post/complete hooks for whichever navigation actually ran.

## Constructors

### Constructor

> **new default**(`chain?`): `RouterExecutionChain`

#### Parameters

##### chain?

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[] \| `RouterExecutionChain` \| `null` = `null`

#### Returns

`RouterExecutionChain`

## Properties

### interceptorIndex

> **interceptorIndex**: `number`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[]

##### Returns

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

#### Parameters

##### interceptor

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

#### Parameters

##### interceptors

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[]

#### Returns

`void`

***

### applyAfterCompletion()

> **applyAfterCompletion**(`route`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyPostHandle()

> **applyPostHandle**(`route`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyPreHandle()

> **applyPreHandle**(`route`): `Promise`\<`boolean`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`Promise`\<`boolean`\>
