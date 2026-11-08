[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache](../README.md) / MemoryCache

# Class: MemoryCache\<V\>

In-memory cache with TTL expiry and bounded-size eviction.

- **Expiry** is lazy: expired entries are removed on `get`/`has` access,
  never by a background sweep (the `TtlContentSource` model — no timers,
  safe in browsers and workers).
- **Eviction** follows the O(1) Map-order technique of the framework's
  internal LRU (`@ndigo/core` `_lru-cache.ts`): `lru` promotes hits by
  delete+reinsert and evicts the map's first key; `fifo` leaves order
  untouched on access and updates, evicting the oldest insertion.
- `defaultTtl`/`maxSize`/`eviction` are fixed at construction — a shared
  instance has uniform behavior (configure per named cache via
  [MemoryCacheManager](../../cache-manager/classes/MemoryCacheManager.md)).

## Type Parameters

### V

`V` = `unknown`

## Implements

- [`Cache`](../interfaces/Cache.md)\<`V`\>

## Constructors

### Constructor

> **new MemoryCache**\<`V`\>(`options?`): `MemoryCache`\<`V`\>

Creates a cache with the given options.

#### Parameters

##### options?

[`CacheOptions`](../interfaces/CacheOptions.md) = `{}`

Store configuration (see [CacheOptions](../interfaces/CacheOptions.md)).

#### Returns

`MemoryCache`\<`V`\>

#### Throws

For a non-integer/negative `maxSize`, a
  non-positive `defaultTtl`, or an unknown `eviction` policy.

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Removes all entries.

#### Returns

`Promise`\<`void`\>

A promise that resolves once cleared.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`clear`](../interfaces/Cache.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Removes an entry.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`boolean`\>

Whether the entry existed.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`delete`](../interfaces/Cache.md#delete)

***

### get()

> **get**(`key`): `Promise`\<[`CacheMiss`](CacheMiss.md) \| `V`\>

Returns the live value or the miss sentinel, promoting LRU hits.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<[`CacheMiss`](CacheMiss.md) \| `V`\>

The cached value, or the miss sentinel.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`get`](../interfaces/Cache.md#get)

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Whether the key holds a live entry.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`boolean`\>

Whether a live entry exists.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`has`](../interfaces/Cache.md#has)

***

### set()

> **set**(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Stores a value with an optional TTL override.

#### Parameters

##### key

`string`

The cache key.

##### value

`V`

The value to store.

##### ttl?

`number`

Optional entry lifetime in milliseconds.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the value is stored.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`set`](../interfaces/Cache.md#set)

***

### size()

> **size**(): `Promise`\<`number`\>

Entry count; expiry is lazy.

#### Returns

`Promise`\<`number`\>

The number of stored entries.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`size`](../interfaces/Cache.md#size)
