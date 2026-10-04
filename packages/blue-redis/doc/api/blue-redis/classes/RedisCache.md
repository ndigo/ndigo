[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-1.md) / RedisCache

# Class: RedisCache\<V\>

Standalone Redis cache. All I/O is through an explicitly connected foundation.
Closing that connection invalidates all its handles. clear()/size() scan only
this namespace; stop concurrent writers for a stable clear/count. No FLUSHDB,
keyspace-wide KEYS command, cluster guarantee or per-cache eviction simulation.

## Type Parameters

### V

`V` = `unknown`

## Implements

- `Cache`\<`V`\>

## Constructors

### Constructor

> **new RedisCache**\<`V`\>(`connection`, `options`): `RedisCache`\<`V`\>

#### Parameters

##### connection

[`RedisConnection`](RedisConnection.md)

##### options

[`RedisCacheOptions`](../interfaces/RedisCacheOptions.md)

#### Returns

`RedisCache`\<`V`\>

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Bounded DEL batches; Redis SCAN COUNT is a hint, not a hard page limit.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`Cache.clear`

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

`Cache.delete`

***

### get()

> **get**(`key`): `Promise`\<`V` \| [`CacheMiss`](#)\>

Returns the live cached value or the [CacheMiss](#) sentinel.
Expiry and recency handling follow the backend's documented policy;
MemoryCache removes expired entries lazily and promotes LRU hits.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`V` \| [`CacheMiss`](#)\>

#### Implementation of

`Cache.get`

***

### has()

> **has**(`key`): `Promise`\<`boolean`\>

Returns whether the key holds a live entry. Does not update recency
in MemoryCache; remote expiry follows the backend's clock.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

`Cache.has`

***

### set()

> **set**(`key`, `value`, `ttl?`): `Promise`\<`void`\>

Stores a value, optionally overriding the backend default TTL.
Capacity and eviction policy are backend-specific configuration.

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

When the value is the [CacheMiss](#) sentinel or
  the TTL is not a positive finite number of milliseconds.

#### Implementation of

`Cache.set`

***

### size()

> **size**(): `Promise`\<`number`\>

Deduplicates SCAN results and checks server-side expiry; not an atomic snapshot.

#### Returns

`Promise`\<`number`\>

#### Implementation of

`Cache.size`
