[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / Cache

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

***

### delete()

> **delete**(`key`): `Promise`\<`boolean`\>

Removes an entry. Returns whether the entry existed.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

***

### get()

> **get**(`key`): `Promise`\<`V` \| [`CacheMiss`](../classes/CacheMiss.md)\>

Returns the live cached value or the [CacheMiss](../classes/CacheMiss.md) sentinel.
Expired entries are removed on access. A hit updates recency under
`lru` eviction (Map-order promotion); `fifo` order is untouched.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`V` \| [`CacheMiss`](../classes/CacheMiss.md)\>

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

***

### set()

> **set**(`key`, `value`, `ttl?`): `Promise`\<`void`\>

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

`Promise`\<`void`\>

#### Throws

When the value is the [CacheMiss](../classes/CacheMiss.md) sentinel or
  the TTL is not a positive finite number of milliseconds.

***

### size()

> **size**(): `Promise`\<`number`\>

Entry count; expiry remains lazy until get/has removes expired entries.

#### Returns

`Promise`\<`number`\>
