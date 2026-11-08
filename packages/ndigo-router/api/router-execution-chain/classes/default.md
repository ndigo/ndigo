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

Index of the last interceptor whose `preHandle` ran.

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

The chain's interceptors, in registration order.

##### Returns

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds one interceptor.

#### Parameters

##### interceptor

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)

The interceptor to add.

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Adds several interceptors.

#### Parameters

##### interceptors

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)[]

The interceptors to add.

#### Returns

`void`

***

### applyAfterCompletion()

> **applyAfterCompletion**(`route`): `Promise`\<`void`\>

Runs `afterCompletion` in reverse registration order.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route to process.

#### Returns

`Promise`\<`void`\>

***

### applyPostHandle()

> **applyPostHandle**(`route`): `Promise`\<`void`\>

Runs `postHandle` in reverse registration order.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route to process.

#### Returns

`Promise`\<`void`\>

***

### applyPreHandle()

> **applyPreHandle**(`route`): `Promise`\<`boolean`\>

Runs `preHandle` in registration order until one rejects.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route to process.

#### Returns

`Promise`\<`boolean`\>

Whether navigation may proceed.
