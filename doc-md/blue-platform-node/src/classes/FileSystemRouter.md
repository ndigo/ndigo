[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / FileSystemRouter

# Class: FileSystemRouter

Defined in: packages/blue-platform-node/src/file-system-router.ts:11

A router implementation for Node.js that resolves routes based on the file system.

## Since

1.0.0

## Extends

- `AbstractRouter`

## Constructors

### Constructor

> **new FileSystemRouter**(`callback`): `FileSystemRouter`

Defined in: packages/blue-platform-node/src/file-system-router.ts:15

#### Parameters

##### callback

`RouterCallback`

#### Returns

`FileSystemRouter`

#### Overrides

`AbstractRouter.constructor`

## Accessors

### route

#### Get Signature

> **get** **route**(): `string`

Defined in: packages/blue-platform-node/src/file-system-router.ts:20

##### Returns

`string`

#### Overrides

`AbstractRouter.route`

***

### callback

#### Get Signature

> **get** **callback**(): `RouterCallback`

Defined in: packages/blue-platform-node/src/file-system-router.ts:24

##### Returns

`RouterCallback`

#### Overrides

`AbstractRouter.callback`

***

### interceptors

#### Get Signature

> **get** `protected` **interceptors**(): `RouterInterceptor`[]

Defined in: packages/blue-router/lib/router.d.ts:46

Returns the list of registered `RouterInterceptor` instances.

##### Since

1.0.0

##### Returns

`RouterInterceptor`[]

An array of `RouterInterceptor`.

#### Inherited from

`AbstractRouter.interceptors`

## Methods

### navigate()

> **navigate**(`path`): `void`

Defined in: packages/blue-platform-node/src/file-system-router.ts:28

#### Parameters

##### path

`string`

#### Returns

`void`

***

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/lib/router.d.ts:53

Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
Duplicate interceptors are ignored.

#### Parameters

##### interceptor

`RouterInterceptor`

The `RouterInterceptor` to add.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

`AbstractRouter.addInterceptor`

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Defined in: packages/blue-router/lib/router.d.ts:63

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| `string`[] \| `RouterInterceptor` \| `RouterMiddleware`

Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.

##### interceptor?

`RouterInterceptor` \| `RouterMiddleware`

The `RouterInterceptor` or `RouterMiddleware` to apply when `interceptorOrPatterns` defines patterns. Required if patterns are provided.

##### excludePatterns?

`string`[]

An optional array of patterns to exclude from matching.

#### Returns

`void`

#### Throws

If `interceptor` is not provided when `interceptorOrPatterns` defines patterns.

#### Since

1.0.0

#### Inherited from

`AbstractRouter.use`

***

### \_toRouterInterceptor()

> `protected` **\_toRouterInterceptor**(`interceptor`): `RouterInterceptor`

Defined in: packages/blue-router/lib/router.d.ts:72

Converts a `RouterMiddleware` function into a `RouterInterceptor` object.
If the input is already a `RouterInterceptor`, it is returned as is.

#### Parameters

##### interceptor

`RouterInterceptor` \| `RouterMiddleware`

The `RouterInterceptor` or `RouterMiddleware` to convert.

#### Returns

`RouterInterceptor`

A `RouterInterceptor` instance.

#### Since

1.0.0

#### Inherited from

`AbstractRouter._toRouterInterceptor`

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-router/lib/router.d.ts:78

Refreshes the current route by re-evaluating it and invoking the router's callback.
This is useful for re-applying routing logic or interceptors without a full page reload.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

`AbstractRouter.refresh`
