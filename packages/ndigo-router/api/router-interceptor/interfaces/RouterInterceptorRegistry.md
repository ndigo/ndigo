[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [router-interceptor](../README.md) / RouterInterceptorRegistry

# Interface: RouterInterceptorRegistry

Defines the interface for a registry that manages `RouterInterceptor` instances.
It provides methods to add interceptors and middleware, with support for path-based matching.

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds one interceptor.

#### Parameters

##### interceptor

[`RouterInterceptor`](RouterInterceptor.md)

The interceptor.

#### Returns

`void`

***

### use()

#### Call Signature

> **use**(`interceptor`): `void`

Adds a global interceptor or middleware.

##### Parameters

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The interceptor/middleware.

##### Returns

`void`

#### Call Signature

> **use**(`includePattern`, `interceptor`): `void`

Adds an interceptor for one path pattern.

##### Parameters

###### includePattern

`string`

The include glob.

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The interceptor/middleware.

##### Returns

`void`

#### Call Signature

> **use**(`includePatterns`, `interceptor`, `excludePatterns?`): `void`

Adds an interceptor for path patterns.

##### Parameters

###### includePatterns

`string`[]

Include globs.

###### interceptor

[`RouterInterceptor`](RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The interceptor/middleware.

###### excludePatterns?

`string`[]

Exclude globs.

##### Returns

`void`
