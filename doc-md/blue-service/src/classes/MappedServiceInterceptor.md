[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / MappedServiceInterceptor

# Class: MappedServiceInterceptor

Defined in: packages/blue-service/src/service.ts:193

Wraps an interceptor so it only applies to matching request paths.

## Constructors

### Constructor

> **new MappedServiceInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedServiceInterceptor`

Defined in: packages/blue-service/src/service.ts:209

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

Defined in: packages/blue-service/src/service.ts:198

##### Returns

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

## Methods

### matches()

> **matches**(`path`, `matcher?`): `boolean`

Defined in: packages/blue-service/src/service.ts:222

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

Defined in: packages/blue-service/src/service.ts:240

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

Defined in: packages/blue-service/src/service.ts:249

Replaces the include pattern list.

#### Parameters

##### includePatterns?

`string`[] = `[]`

Glob patterns to accept.

#### Returns

`void`
