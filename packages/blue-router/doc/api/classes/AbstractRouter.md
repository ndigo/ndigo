[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / AbstractRouter

# Abstract Class: AbstractRouter

An abstract base class that provides common functionality for router implementations.
It includes mechanisms for managing route interceptors.

## Since

1.0.0

## Extended by

- [`PartitionRouter`](PartitionRouter.md)

## Implements

- [`Router`](../interfaces/Router.md)
- [`RouterInterceptorRegistry`](../interfaces/RouterInterceptorRegistry.md)

## Constructors

### Constructor

> **new AbstractRouter**(): `AbstractRouter`

#### Returns

`AbstractRouter`

## Properties

### callback

> `abstract` `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

#### Implementation of

[`Router`](../interfaces/Router.md).[`callback`](../interfaces/Router.md#callback)

## Accessors

### route

#### Get Signature

> **get** `abstract` **route**(): `string`

##### Returns

`string`

#### Implementation of

[`Router`](../interfaces/Router.md).[`route`](../interfaces/Router.md#route)

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

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

### refresh()

> **refresh**(): `void`

Refreshes the current route by re-evaluating it and invoking the router's callback.
This is useful for re-applying routing logic or interceptors without a full page reload.

#### Returns

`void`

#### Since

1.0.0

#### Implementation of

[`Router`](../interfaces/Router.md).[`refresh`](../interfaces/Router.md#refresh)

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| [`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md) \| `string`[]

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
