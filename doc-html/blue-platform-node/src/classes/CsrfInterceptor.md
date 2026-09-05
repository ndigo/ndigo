[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / CsrfInterceptor

# Class: CsrfInterceptor

Defined in: [packages/blue-platform-node/src/csrf-interceptor.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/csrf-interceptor.ts#lines-58)

A [RouteHandlerInterceptor](#) enforcing double-submit-cookie CSRF.

Register on a handler mapping alongside the logging interceptor:

```ts
const mapping = new RadixMetadataHandlerMapping();
mapping.interceptors.push(new CsrfInterceptor());
```

## Implements

- [`RouteHandlerInterceptor`](#)

## Constructors

### Constructor

> **new CsrfInterceptor**(`options?`): `CsrfInterceptor`

Defined in: [packages/blue-platform-node/src/csrf-interceptor.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/csrf-interceptor.ts#lines-68)

#### Parameters

##### options?

[`CsrfInterceptorOptions`](../interfaces/CsrfInterceptorOptions.md) = `{}`

Interceptor options.

#### Returns

`CsrfInterceptor`

## Methods

### postHandle()

> **postHandle**(): `void`

Defined in: [packages/blue-platform-node/src/csrf-interceptor.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/csrf-interceptor.ts#lines-76)

#### Returns

`void`

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### completeHandle()

> **completeHandle**(): `void`

Defined in: [packages/blue-platform-node/src/csrf-interceptor.ts:80](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/csrf-interceptor.ts#lines-80)

#### Returns

`void`

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### preHandle()

> **preHandle**(`route`): `boolean`

Defined in: [packages/blue-platform-node/src/csrf-interceptor.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/csrf-interceptor.ts#lines-91)

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
