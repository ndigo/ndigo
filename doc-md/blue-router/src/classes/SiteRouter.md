[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / SiteRouter

# Class: SiteRouter

Defined in: [packages/blue-router/src/site-router.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-31)

A concrete router implementation that extends `AbstractRouter` to manage and navigate through site-wide routes.
It supports mounting feature-specific routes at defined prefixes.

## Since

1.0.0

## Extends

- [`AbstractRouter`](AbstractRouter.md)

## Constructors

### Constructor

> **new SiteRouter**(): `SiteRouter`

Defined in: [packages/blue-router/src/site-router.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-49)

Creates an instance of `SiteRouter`.

#### Returns

`SiteRouter`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`constructor`](AbstractRouter.md#constructor)

## Accessors

### interceptors

#### Get Signature

> **get** `protected` **interceptors**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

Defined in: [packages/blue-router/src/router.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router.ts#lines-60)

Returns the list of registered `RouterInterceptor` instances.

##### Since

1.0.0

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

An array of `RouterInterceptor`.

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`interceptors`](AbstractRouter.md#interceptors)

***

### route

#### Get Signature

> **get** **route**(): `string`

Defined in: [packages/blue-router/src/site-router.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-41)

Gets the current full route path managed by the `SiteRouter`.

##### Since

1.0.0

##### Returns

`string`

The current route path as a string.

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`route`](AbstractRouter.md#route)

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: [packages/blue-router/src/router.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router.ts#lines-70)

Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
Duplicate interceptors are ignored.

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

The `RouterInterceptor` to add.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`addInterceptor`](AbstractRouter.md#addinterceptor)

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Defined in: [packages/blue-router/src/router.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router.ts#lines-85)

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| `string`[] \| [`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.

##### interceptor?

[`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The `RouterInterceptor` or `RouterMiddleware` to apply when `interceptorOrPatterns` defines patterns. Required if patterns are provided.

##### excludePatterns?

`string`[] = `[]`

An optional array of patterns to exclude from matching.

#### Returns

`void`

#### Throws

If `interceptor` is not provided when `interceptorOrPatterns` defines patterns.

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`use`](AbstractRouter.md#use)

***

### \_toRouterInterceptor()

> `protected` **\_toRouterInterceptor**(`interceptor`): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)

Defined in: [packages/blue-router/src/router.ts:116](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router.ts#lines-116)

Converts a `RouterMiddleware` function into a `RouterInterceptor` object.
If the input is already a `RouterInterceptor`, it is returned as is.

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The `RouterInterceptor` or `RouterMiddleware` to convert.

#### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

A `RouterInterceptor` instance.

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`_toRouterInterceptor`](AbstractRouter.md#_torouterinterceptor)

***

### callback()

> `readonly` **callback**(): `undefined`

Defined in: [packages/blue-router/src/site-router.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-32)

#### Returns

`undefined`

#### Overrides

`AbstractRouter.callback`

***

### mount()

> **mount**(`prefix`, `callback`): `this`

Defined in: [packages/blue-router/src/site-router.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-63)

Mounts a feature route at a specified URL prefix.
When a route matching the prefix is navigated, the provided callback will be invoked with the stripped route.

#### Parameters

##### prefix

`string`

The URL prefix at which to mount the feature route.

##### callback

[`FeatureRouteCallback`](../type-aliases/FeatureRouteCallback.md)

The `FeatureRouteCallback` to execute when the prefix matches.

#### Returns

`this`

The current `SiteRouter` instance for chaining.

#### Since

1.0.0

***

### refresh()

> **refresh**(): `void`

Defined in: [packages/blue-router/src/site-router.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-76)

Refreshes the current route by re-navigating to the last known route.
This can be used to re-evaluate all mounted routes and their callbacks.

#### Returns

`void`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`refresh`](AbstractRouter.md#refresh)

***

### navigate()

> **navigate**(`path`): `boolean`

Defined in: [packages/blue-router/src/site-router.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/site-router.ts#lines-89)

Navigates the router to the specified path.
It attempts to match the path against all mounted feature routes and invokes the corresponding callback.

#### Parameters

##### path

`string`

The path to navigate to.

#### Returns

`boolean`

`true` if a mounted route handled the navigation, `false` otherwise.

#### Since

1.0.0
