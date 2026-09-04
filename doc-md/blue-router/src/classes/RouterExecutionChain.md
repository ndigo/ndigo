[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouterExecutionChain

# Class: RouterExecutionChain

Defined in: packages/blue-router/src/router-execution-chain.ts:8

## Constructors

### Constructor

> **new RouterExecutionChain**(`chain?`): `RouterExecutionChain`

Defined in: packages/blue-router/src/router-execution-chain.ts:21

#### Parameters

##### chain?

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[] \| `RouterExecutionChain` \| `null`

#### Returns

`RouterExecutionChain`

## Properties

### interceptorIndex

> **interceptorIndex**: `number`

Defined in: packages/blue-router/src/router-execution-chain.ts:11

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-router/src/router-execution-chain.ts:13

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

Defined in: packages/blue-router/src/router-execution-chain.ts:17

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/router-execution-chain.ts:36

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Defined in: packages/blue-router/src/router-execution-chain.ts:45

#### Parameters

##### interceptors

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

#### Returns

`void`

***

### applyPostHandle()

> **applyPostHandle**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-router/src/router-execution-chain.ts:57

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyAfterCompletion()

> **applyAfterCompletion**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-router/src/router-execution-chain.ts:74

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

***

### applyPreHandle()

> **applyPreHandle**(`route`): `Promise`\<`boolean`\>

Defined in: packages/blue-router/src/router-execution-chain.ts:91

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

#### Returns

`Promise`\<`boolean`\>
