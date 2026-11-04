[**@ndigo/router v0.0.1**](../README.md)

***

[@ndigo/router](../README.md) / RouterExecutionChain

# Class: RouterExecutionChain

## Constructors

### Constructor

> **new RouterExecutionChain**(`chain?`): `RouterExecutionChain`

#### Parameters

##### chain?

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[] \| `RouterExecutionChain` \| `null` = `null`

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

> **get** **interceptors**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

#### Parameters

##### interceptors

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

#### Returns

`void`

***

### applyAfterCompletion()

> **applyAfterCompletion**(`route`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyPostHandle()

> **applyPostHandle**(`route`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyPreHandle()

> **applyPreHandle**(`route`): `Promise`\<`boolean`\>

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`boolean`\>
