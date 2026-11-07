[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / MappedServiceInterceptor

# Class: MappedServiceInterceptor

Wraps an interceptor so it only applies to matching request paths.

## Constructors

### Constructor

> **new MappedServiceInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedServiceInterceptor`

Creates a path-mapped interceptor.

#### Parameters

##### interceptor

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

Interceptor to wrap.

##### includePatterns

`string`[]

Glob patterns that opt the interceptor in.

##### excludePatterns?

`string`[]

Glob patterns that opt the interceptor out.

#### Returns

`MappedServiceInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

The wrapped interceptor.

##### Returns

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

## Methods

### matches()

> **matches**(`path`, `matcher?`): `boolean`

Checks whether a path matches the configured include and exclude patterns.

#### Parameters

##### path

`string`

Request path to evaluate.

##### matcher?

(`path`, `pattern`) => `boolean`

Optional pattern matcher used for comparisons.

#### Returns

`boolean`

`true` when the path should use the wrapped interceptor.

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns?`): `void`

Replaces the exclude pattern list.

#### Parameters

##### excludePatterns?

`string`[] = `[]`

Glob patterns to skip.

#### Returns

`void`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns?`): `void`

Replaces the include pattern list.

#### Parameters

##### includePatterns?

`string`[] = `[]`

Glob patterns to accept.

#### Returns

`void`
