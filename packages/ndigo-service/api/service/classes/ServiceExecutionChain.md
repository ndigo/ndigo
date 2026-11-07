[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / ServiceExecutionChain

# Class: ServiceExecutionChain

Builds and advances the interceptor chain for a service call.

## Constructors

### Constructor

> **new ServiceExecutionChain**(`service`, `interceptors?`): `ServiceExecutionChain`

Creates a chain from a service or an existing chain.

#### Parameters

##### service

`ServiceExecutionChain` \| [`Service`](Service.md)

Service or chain to wrap.

##### interceptors?

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[] \| `null` = `null`

Additional interceptors to append.

#### Returns

`ServiceExecutionChain`

## Properties

### interceptorIndex

> **interceptorIndex**: `number`

Index of the interceptor currently executing.

***

### service

> **service**: [`Service`](Service.md)

The service this chain executes.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

The interceptors in this chain, in execution order.

##### Returns

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds a single interceptor to the chain.

#### Parameters

##### interceptor

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

Interceptor to append.

#### Returns

`void`

#### Throws

When the value does not look like a service interceptor.

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Adds multiple interceptors to the chain in order.

#### Parameters

##### interceptors

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

Interceptors to append.

#### Returns

`void`
