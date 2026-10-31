[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / RouterInterceptorRegistry

# Interface: RouterInterceptorRegistry

Defines the interface for a registry that manages `RouterInterceptor` instances.
It provides methods to add interceptors and middleware, with support for path-based matching.

## Since

1.0.0

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

#### Parameters

##### interceptor

[`RouterInterceptor`](RouterInterceptor.md)

#### Returns

`void`

***

### use()

#### Call Signature

> **use**(`interceptor`): `void`

##### Parameters

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

##### Returns

`void`

#### Call Signature

> **use**(`includePattern`, `interceptor`): `void`

##### Parameters

###### includePattern

`string`

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

##### Returns

`void`

#### Call Signature

> **use**(`includePatterns`, `interceptor`, `excludePatterns?`): `void`

##### Parameters

###### includePatterns

`string`[]

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

###### excludePatterns?

`string`[]

##### Returns

`void`
