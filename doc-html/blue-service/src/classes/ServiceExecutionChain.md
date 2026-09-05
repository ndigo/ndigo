[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / ServiceExecutionChain

# Class: ServiceExecutionChain

Defined in: [packages/blue-service/src/service.ts:261](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-261)

Builds and advances the interceptor chain for a service call.

## Constructors

### Constructor

> **new ServiceExecutionChain**(`service`, `interceptors?`): `ServiceExecutionChain`

Defined in: [packages/blue-service/src/service.ts:281](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-281)

Creates a chain from a service or an existing chain.

#### Parameters

##### service

`ServiceExecutionChain` \| `Service`

Service or chain to wrap.

##### interceptors?

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[] \| `null`

Additional interceptors to append.

#### Returns

`ServiceExecutionChain`

## Properties

### service

> **service**: `Service`

Defined in: [packages/blue-service/src/service.ts:264](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-264)

***

### interceptorIndex

> **interceptorIndex**: `number`

Defined in: [packages/blue-service/src/service.ts:265](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-265)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-service/src/service.ts:267](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-267)

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

Defined in: [packages/blue-service/src/service.ts:271](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-271)

##### Returns

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: [packages/blue-service/src/service.ts:309](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-309)

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

Defined in: [packages/blue-service/src/service.ts:329](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/service.ts#lines-329)

Adds multiple interceptors to the chain in order.

#### Parameters

##### interceptors

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)[]

Interceptors to append.

#### Returns

`void`
