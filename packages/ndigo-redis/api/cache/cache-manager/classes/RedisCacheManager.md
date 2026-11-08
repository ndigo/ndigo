[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [cache/cache-manager](../README.md) / RedisCacheManager

# Class: RedisCacheManager

Local named-handle registry over shared Redis data. getCache/hasCache perform
no I/O; hasCache means this manager acquired a handle, not that Redis has data.
Container-compatible close() drains operations; a ready injected client is
borrowed and remains usable after manager shutdown.

## Implements

- `CacheManager`
- `AsyncCloseable`

## Constructors

### Constructor

> **new RedisCacheManager**(`options`): `RedisCacheManager`

Creates a manager over a borrowed or owned Redis connection.

#### Parameters

##### options

[`RedisCacheManagerOptions`](../type-aliases/RedisCacheManagerOptions.md)

Connection, namespace, and TTL defaults.

#### Returns

`RedisCacheManager`

## Accessors

### lastError

#### Get Signature

> **get** **lastError**(): `Error` \| `undefined`

The most recent connection error, when one occurred.

##### Returns

`Error` \| `undefined`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Seals the manager and closes the underlying connection.

#### Returns

`Promise`\<`void`\>

A promise that resolves once closed.

#### Implementation of

`AsyncCloseable.close`

***

### connect()

> **connect**(): `Promise`\<`void`\>

Connects the underlying Redis connection.

#### Returns

`Promise`\<`void`\>

A promise that resolves once connected.

***

### getCache()

Returns the cache for a name or token.

#### Param

**nameOrToken**

Cache name or typed store token.

#### Call Signature

> **getCache**\<`V`\>(`name`): [`RedisCache`](../../cache/classes/RedisCache.md)\<`V`\>

Returns the named cache, auto-creating its handle.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

[`RedisCache`](../../cache/classes/RedisCache.md)\<`V`\>

The Redis cache handle.

##### Implementation of

`CacheManager.getCache`

#### Call Signature

> **getCache**\<`V`\>(`token`): [`RedisCache`](../../cache/classes/RedisCache.md)\<`V`\>

Returns the token-identified cache, auto-creating its handle.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

[`ContextToken`](#)\<`Cache`\<`V`\>\>

The cache store token.

##### Returns

[`RedisCache`](../../cache/classes/RedisCache.md)\<`V`\>

The Redis cache handle.

##### Implementation of

`CacheManager.getCache`

***

### hasCache()

Returns whether this manager acquired a handle for the name or token.

#### Param

**nameOrToken**

Cache name or typed store token.

#### Call Signature

> **hasCache**(`name`): `boolean`

Returns whether this manager acquired a handle for the name.

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

`boolean`

Whether the handle exists.

##### Implementation of

`CacheManager.hasCache`

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether this manager acquired a handle for the token.

##### Parameters

###### token

[`ContextToken`](#)\<`Cache`\<`unknown`\>\>

The cache store token.

##### Returns

`boolean`

Whether the handle exists.

##### Implementation of

`CacheManager.hasCache`
