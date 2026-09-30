[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / TtlContentSource

# Class: TtlContentSource

Content source that wraps a loader with a TTL-based in-memory cache.

`getContent` is async by contract; the loader runs once per key+language
pair and the result is cached until it expires.

## Implements

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new TtlContentSource**(`loader`, `ttl?`): `TtlContentSource`

Creates a TTL content source.

#### Parameters

##### loader

[`ContentLoader`](../type-aliases/ContentLoader.md)

Async function that loads content by key and language.

##### ttl?

`number` = `60_000`

Cache lifetime in milliseconds. Defaults to 60 000 ms.

#### Returns

`TtlContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Loads content via the loader when no unexpired cached value exists,
stores it, and returns it.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`Promise`\<`string`\>

The resolved content value.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)

***

### invalidate()

> **invalidate**(): `void`

Evicts all cached entries, forcing the next load to call the loader.

#### Returns

`void`

***

### invalidateEntry()

> **invalidateEntry**(`key`, `language`): `void`

Evicts the cache entry for a specific key+language pair.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`void`
