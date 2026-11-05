[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [partition-router](../README.md) / PartitionRouter

# Class: PartitionRouter

A concrete router implementation that extends `AbstractRouter` to manage
and navigate through partitioned routes.
It supports mounting feature-specific routes at defined prefixes.

## Since

1.0.0

## Extends

- [`AbstractRouter`](../../router/classes/AbstractRouter.md)

## Constructors

### Constructor

> **new PartitionRouter**(): `PartitionRouter`

Creates an instance of `PartitionRouter`.

#### Returns

`PartitionRouter`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](../../router/classes/AbstractRouter.md).[`constructor`](../../router/classes/AbstractRouter.md#constructor)

## Accessors

### route

#### Get Signature

> **get** **route**(): `string`

Gets the current full route path managed by the `PartitionRouter`.

##### Since

1.0.0

##### Returns

`string`

The current route path as a string.

#### Overrides

[`AbstractRouter`](../../router/classes/AbstractRouter.md).[`route`](../../router/classes/AbstractRouter.md#route)

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
Duplicate interceptors are ignored.

#### Parameters

##### interceptor

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md)

The `RouterInterceptor` to add.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](../../router/classes/AbstractRouter.md).[`addInterceptor`](../../router/classes/AbstractRouter.md#addinterceptor)

***

### callback()

> `readonly` **callback**(): `undefined`

#### Returns

`undefined`

#### Overrides

`AbstractRouter.callback`

***

### mount()

> **mount**(`prefix`, `callback`): `this`

Mounts a feature route at a specified URL prefix.
When a route matching the prefix is navigated, the provided callback will be invoked with the stripped route.

Prefixes are unique per router: navigation dispatches to the first
matching mount and `unmount` removes by prefix, so a second mount at an
existing prefix would be unreachable and could unmount its sibling.

#### Parameters

##### prefix

`string`

The URL prefix at which to mount the feature route.

##### callback

[`FeatureRouteCallback`](../type-aliases/FeatureRouteCallback.md)

The `FeatureRouteCallback` to execute when the prefix matches.

#### Returns

`this`

The current `PartitionRouter` instance for chaining.

#### Throws

When a mount already exists at the normalized prefix.

#### Since

1.0.0

***

### navigate()

> **navigate**(`path`): `boolean`

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

***

### refresh()

> **refresh**(): `void`

Refreshes the current route by re-navigating to the last known route.
This can be used to re-evaluate all mounted routes and their callbacks.

#### Returns

`void`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](../../router/classes/AbstractRouter.md).[`refresh`](../../router/classes/AbstractRouter.md#refresh)

***

### unmount()

> **unmount**(`prefix`): `boolean`

Removes a mounted feature route at the specified URL prefix.

#### Parameters

##### prefix

`string`

The URL prefix to unmount.

#### Returns

`boolean`

`true` if a mount was removed, `false` if none matched.

#### Since

1.0.0

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| [`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../../router-interceptor/type-aliases/RouterMiddleware.md) \| `string`[]

Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.

##### interceptor?

[`RouterInterceptor`](../../router-interceptor/interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../../router-interceptor/type-aliases/RouterMiddleware.md)

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

[`AbstractRouter`](../../router/classes/AbstractRouter.md).[`use`](../../router/classes/AbstractRouter.md#use)
