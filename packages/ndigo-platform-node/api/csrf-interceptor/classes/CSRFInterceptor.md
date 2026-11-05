[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [csrf-interceptor](../README.md) / CSRFInterceptor

# Class: CSRFInterceptor

A [RouteHandlerInterceptor](#) enforcing double-submit-cookie CSRF.

Register on a handler mapping alongside the logging interceptor:

```ts
const mapping = new RadixMetadataHandlerMapping();
mapping.interceptors.push(new CSRFInterceptor());
```

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new CSRFInterceptor**(`options?`): `CSRFInterceptor`

#### Parameters

##### options?

[`CSRFInterceptorOptions`](../interfaces/CSRFInterceptorOptions.md) = `{}`

Interceptor options.

#### Returns

`CSRFInterceptor`

## Methods

### completeHandle()

> **completeHandle**(): `void`

#### Returns

`void`

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(): `void`

#### Returns

`void`

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`): `boolean`

Validates the request's CSRF token for mutating methods, issuing the
cookie on first (safe) visit.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`false` (with a 403 written) when the token is missing/mismatched.

#### Implementation of

`RouteHandlerInterceptor.preHandle`
