[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / Cache

# Interface: Cache\<V\>

The generic cache contract. Synchronous by design — async loads
(single-flight coalescing, promise-aware writes, rejection passthrough)
are the caller's concern; see [memoize](../functions/memoize.md) and the [cached](../functions/cached.md)
decorator for those semantics.

## Type Parameters

### V

`V` = `unknown`

## Properties

### size

> `readonly` **size**: `number`

Current live-entry count.

## Methods

### clear()

> **clear**(): `void`

Removes all entries.

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Removes an entry. Returns whether the entry existed.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### get()

> **get**(`key`): `V` \| [`CacheMiss`](../classes/CacheMiss.md)

Returns the live cached value or the [CacheMiss](../classes/CacheMiss.md) sentinel.
Expired entries are removed on access. A hit updates recency under
`lru` eviction (Map-order promotion); `fifo` order is untouched.

#### Parameters

##### key

`string`

#### Returns

`V` \| [`CacheMiss`](../classes/CacheMiss.md)

***

### has()

> **has**(`key`): `boolean`

Returns whether the key holds a live entry (expired entries are
removed on the check). Does not update recency.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### set()

> **set**(`key`, `value`, `ttl?`): `void`

Stores a value, optionally overriding the store default TTL. Evicts
per the configured policy when at [CacheOptions.maxSize](CacheOptions.md#maxsize).

#### Parameters

##### key

`string`

##### value

`V`

##### ttl?

`number`

#### Returns

`void`

#### Throws

When the value is the [CacheMiss](../classes/CacheMiss.md) sentinel or
  the TTL is not a positive finite number of milliseconds.
