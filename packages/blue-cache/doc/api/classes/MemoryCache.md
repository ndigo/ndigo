[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / MemoryCache

# Class: MemoryCache\<V\>

In-memory cache with TTL expiry and bounded-size eviction.

- **Expiry** is lazy: expired entries are removed on `get`/`has` access,
  never by a background sweep (the `TtlContentSource` model — no timers,
  safe in browsers and workers).
- **Eviction** follows the O(1) Map-order technique of the framework's
  internal LRU (`@blue/core` `_lru-cache.ts`): `lru` promotes hits by
  delete+reinsert and evicts the map's first key; `fifo` leaves order
  untouched on access and updates, evicting the oldest insertion.
- `defaultTtl`/`maxSize`/`eviction` are fixed at construction — a shared
  instance has uniform behavior (configure per named cache via
  [MemoryCacheManager](MemoryCacheManager.md)).

## Type Parameters

### V

`V` = `unknown`

## Implements

- [`Cache`](../interfaces/Cache.md)\<`V`\>

## Constructors

### Constructor

> **new MemoryCache**\<`V`\>(`options?`): `MemoryCache`\<`V`\>

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

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`clear`](../interfaces/Cache.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Removes an entry. Returns whether the entry existed.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`delete`](../interfaces/Cache.md#delete)

***

### get()

> **get**(`key`): `Promise`\<[`CacheMiss`](CacheMiss.md) \| `V`\>

Returns the live cached value or the [CacheMiss](CacheMiss.md) sentinel.
Expired entries are removed on access. A hit updates recency under
`lru` eviction (Map-order promotion); `fifo` order is untouched.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`CacheMiss`](CacheMiss.md) \| `V`\>

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`get`](../interfaces/Cache.md#get)

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Returns whether the key holds a live entry (expired entries are
removed on the check). Does not update recency.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`has`](../interfaces/Cache.md#has)

***

### set()

> **set**(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Stores a value, optionally overriding the store default TTL. Evicts
per the configured policy when at [CacheOptions.maxSize](../interfaces/CacheOptions.md#maxsize).

#### Parameters

##### key

`string`

##### value

`V`

##### ttl?

`number`

#### Returns

`Promise`\<`void`\>

#### Throws

When the value is the [CacheMiss](CacheMiss.md) sentinel or
  the TTL is not a positive finite number of milliseconds.

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`set`](../interfaces/Cache.md#set)

***

### size()

> **size**(): `Promise`\<`number`\>

Entry count; expiry is lazy.

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`Cache`](../interfaces/Cache.md).[`size`](../interfaces/Cache.md#size)
