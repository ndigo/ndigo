[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / AbstractRouter

# Abstract Class: AbstractRouter

Defined in: packages/blue-router/src/router.ts:44

An abstract base class that provides common functionality for router implementations.
It includes mechanisms for managing route interceptors.

## Since

1.0.0

## Extended by

- [`SiteRouter`](SiteRouter.md)
- [`HashRouter`](HashRouter.md)

## Implements

- [`Router`](../interfaces/Router.md)
- [`RouterInterceptorRegistry`](../interfaces/RouterInterceptorRegistry.md)

## Constructors

### Constructor

> **new AbstractRouter**(): `AbstractRouter`

Defined in: packages/blue-router/src/router.ts:47

#### Returns

`AbstractRouter`

## Properties

### callback

> `abstract` `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Defined in: packages/blue-router/src/router.ts:52

#### Implementation of

[`Router`](../interfaces/Router.md).[`callback`](../interfaces/Router.md#callback)

## Accessors

### route

#### Get Signature

> **get** `abstract` **route**(): `string`

Defined in: packages/blue-router/src/router.ts:51

##### Returns

`string`

#### Implementation of

[`Router`](../interfaces/Router.md).[`route`](../interfaces/Router.md#route)

***

### interceptors

#### Get Signature

> **get** `protected` **interceptors**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

Defined in: packages/blue-router/src/router.ts:60

Returns the list of registered `RouterInterceptor` instances.

##### Since

1.0.0

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

An array of `RouterInterceptor`.

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/router.ts:70

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

#### Implementation of

[`RouterInterceptorRegistry`](../interfaces/RouterInterceptorRegistry.md).[`addInterceptor`](../interfaces/RouterInterceptorRegistry.md#addinterceptor)

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Defined in: packages/blue-router/src/router.ts:85

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

#### Implementation of

[`RouterInterceptorRegistry`](../interfaces/RouterInterceptorRegistry.md).[`use`](../interfaces/RouterInterceptorRegistry.md#use)

***

### \_toRouterInterceptor()

> `protected` **\_toRouterInterceptor**(`interceptor`): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)

Defined in: packages/blue-router/src/router.ts:116

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

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-router/src/router.ts:134

Refreshes the current route by re-evaluating it and invoking the router's callback.
This is useful for re-applying routing logic or interceptors without a full page reload.

#### Returns

`void`

#### Since

1.0.0

#### Implementation of

[`Router`](../interfaces/Router.md).[`refresh`](../interfaces/Router.md#refresh)
