[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / TtlContentSource

# Class: TtlContentSource

Defined in: [packages/blue-content/src/async.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-28)

Content source that wraps an async loader with a TTL-based in-memory cache.

Synchronous `getContent` returns the cached value when available, or the key
itself as a fallback until the first async load completes.

## Implements

- [`AsyncContentSource`](../interfaces/AsyncContentSource.md)

## Constructors

### Constructor

> **new TtlContentSource**(`loader`, `ttl?`): `TtlContentSource`

Defined in: [packages/blue-content/src/async.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-39)

Creates a TTL content source.

#### Parameters

##### loader

[`AsyncContentLoader`](../type-aliases/AsyncContentLoader.md)

Async function that loads content by key and language.

##### ttl?

`number` = `60_000`

Cache lifetime in milliseconds. Defaults to 60 000 ms.

#### Returns

`TtlContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-content/src/async.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-49)

Returns the cached content for the key+language pair, or the key itself
when no cached value is present.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`string`

#### Implementation of

[`AsyncContentSource`](../interfaces/AsyncContentSource.md).[`getContent`](../interfaces/AsyncContentSource.md#getcontent)

***

### getContentAsync()

> **getContentAsync**(`key`, `language`): `Promise`\<`string`\>

Defined in: [packages/blue-content/src/async.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-64)

Loads content via the async loader, stores it in the cache, and returns it.
Uses the cached value when it has not yet expired.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`AsyncContentSource`](../interfaces/AsyncContentSource.md).[`getContentAsync`](../interfaces/AsyncContentSource.md#getcontentasync)

***

### invalidate()

> **invalidate**(): `void`

Defined in: [packages/blue-content/src/async.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-85)

Evicts all cached entries, forcing the next load to call the loader.

#### Returns

`void`

***

### invalidateEntry()

> **invalidateEntry**(`key`, `language`): `void`

Defined in: [packages/blue-content/src/async.ts:92](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-92)

Evicts the cache entry for a specific key+language pair.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`void`
