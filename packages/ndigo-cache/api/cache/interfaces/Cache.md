[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache](../README.md) / Cache

# Interface: Cache\<V\>

The generic awaitable cache contract. Backend failures reject rather than
becoming misses. Cache handles are acquired synchronously through the
manager; data operations are awaited for both memory and remote stores.

## Type Parameters

### V

`V` = `unknown`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Removes all entries.

#### Returns

`Promise`\<`void`\>

A promise that resolves once cleared.

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Removes an entry. Returns whether the entry existed.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`boolean`\>

Whether the entry existed.

***

### get()

> **get**(`key`): `Promise`\<`V` \| [`CacheMiss`](../classes/CacheMiss.md)\>

Returns the live cached value or the [CacheMiss](../classes/CacheMiss.md) sentinel.
Expiry and recency handling follow the backend's documented policy;
MemoryCache removes expired entries lazily and promotes LRU hits.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`V` \| [`CacheMiss`](../classes/CacheMiss.md)\>

The cached value, or the miss sentinel.

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Returns whether the key holds a live entry. Does not update recency
in MemoryCache; remote expiry follows the backend's clock.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`boolean`\>

Whether a live entry exists.

***

### set()

> **set**(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Stores a value, optionally overriding the backend default TTL.
Capacity and eviction policy are backend-specific configuration.

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

#### Throws

When the value is the [CacheMiss](../classes/CacheMiss.md) sentinel or
  the TTL is not a positive finite number of milliseconds.

***

### size()

> **size**(): `Promise`\<`number`\>

Entry count under the backend's documented expiry/concurrency policy.

#### Returns

`Promise`\<`number`\>

The entry count.
