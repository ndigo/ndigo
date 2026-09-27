[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / FileSystemRouter

# Class: FileSystemRouter

A router implementation for Node.js that resolves routes based on the file system.

## Since

1.0.0

## Extends

- `AbstractRouter`

## Constructors

### Constructor

> **new FileSystemRouter**(`callback`): `FileSystemRouter`

#### Parameters

##### callback

`RouterCallback`

#### Returns

`FileSystemRouter`

#### Overrides

`AbstractRouter.constructor`

## Accessors

### callback

#### Get Signature

> **get** **callback**(): `RouterCallback`

##### Returns

`RouterCallback`

#### Overrides

`AbstractRouter.callback`

***

### route

#### Get Signature

> **get** **route**(): `string`

##### Returns

`string`

#### Overrides

`AbstractRouter.route`

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

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

### navigate()

> **navigate**(`path`): `void`

#### Parameters

##### path

`string`

#### Returns

`void`

***

### refresh()

> **refresh**(): `void`

Refreshes the current route by re-evaluating it and invoking the router's callback.
This is useful for re-applying routing logic or interceptors without a full page reload.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

`AbstractRouter.refresh`

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

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
