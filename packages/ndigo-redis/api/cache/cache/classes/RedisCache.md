[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [cache/cache](../README.md) / RedisCache

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

Creates a cache handle over the given connection and namespace.

#### Parameters

##### connection

[`RedisConnection`](../../../connection/classes/RedisConnection.md)

The Redis connection to run commands on.

##### options

[`RedisCacheOptions`](../interfaces/RedisCacheOptions.md)

Namespace, cache name, and TTL defaults.

#### Returns

`RedisCache`\<`V`\>

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Bounded DEL batches; Redis SCAN COUNT is a hint, not a hard page limit.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the namespace is cleared.

#### Implementation of

`Cache.clear`

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

`Cache.delete`

***

### get()

> **get**(`key`): `Promise`\<`V` \| [`CacheMiss`](#)\>

Returns the live cached value or the miss sentinel.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`V` \| [`CacheMiss`](#)\>

The cached value, or the miss sentinel.

#### Implementation of

`Cache.get`

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

`Cache.has`

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

A promise that resolves once stored.

#### Implementation of

`Cache.set`

***

### size()

> **size**(): `Promise`\<`number`\>

Deduplicates SCAN results and checks server-side expiry; not an atomic snapshot.

#### Returns

`Promise`\<`number`\>

The number of live entries in this namespace.

#### Implementation of

`Cache.size`
