[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouterInterceptorRegistry

# Interface: RouterInterceptorRegistry

Defined in: packages/blue-router/src/router-interceptor.ts:39

Defines the interface for a registry that manages `RouterInterceptor` instances.
It provides methods to add interceptors and middleware, with support for path-based matching.

## Since

1.0.0

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/router-interceptor.ts:40

#### Parameters

##### interceptor

[`RouterInterceptor`](RouterInterceptor.md)

#### Returns

`void`

***

### use()

#### Call Signature

> **use**(`interceptor`): `void`

Defined in: packages/blue-router/src/router-interceptor.ts:41

##### Parameters

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

##### Returns

`void`

#### Call Signature

> **use**(`includePattern`, `interceptor`): `void`

Defined in: packages/blue-router/src/router-interceptor.ts:42

##### Parameters

###### includePattern

`string`

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

##### Returns

`void`

#### Call Signature

> **use**(`includePatterns`, `interceptor`, `excludePatterns?`): `void`

Defined in: packages/blue-router/src/router-interceptor.ts:43

##### Parameters

###### includePatterns

`string`[]

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

###### excludePatterns?

`string`[]

##### Returns

`void`
