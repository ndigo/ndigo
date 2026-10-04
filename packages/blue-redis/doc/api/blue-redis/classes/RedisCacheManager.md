[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-1.md) / RedisCacheManager

# Class: RedisCacheManager

Local named-handle registry over shared Redis data. getCache/hasCache perform
no I/O; hasCache means this manager acquired a handle, not that Redis has data.
Container-compatible close() drains operations; a ready injected client is
borrowed and remains usable after manager shutdown.

## Implements

- `CacheManager`

## Constructors

### Constructor

> **new RedisCacheManager**(`options`): `RedisCacheManager`

#### Parameters

##### options

[`RedisCacheManagerOptions`](../type-aliases/RedisCacheManagerOptions.md)

#### Returns

`RedisCacheManager`

## Accessors

### lastError

#### Get Signature

> **get** **lastError**(): `Error` \| `undefined`

##### Returns

`Error` \| `undefined`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### connect()

> **connect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### getCache()

#### Call Signature

> **getCache**\<`V`\>(`name`): [`RedisCache`](RedisCache.md)\<`V`\>

Returns the named cache, auto-creating it with the manager defaults
when absent.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

[`RedisCache`](RedisCache.md)\<`V`\>

##### Throws

For a non-string or empty name.

##### Implementation of

`CacheManager.getCache`

#### Call Signature

> **getCache**\<`V`\>(`token`): [`RedisCache`](RedisCache.md)\<`V`\>

Returns the cache identified by a typed store token (AD-34 D7) —
description-backed, same store as the string form.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

[`ContextToken`](#)\<`Cache`\<`V`\>\>

The cache store token.

##### Returns

[`RedisCache`](RedisCache.md)\<`V`\>

##### Implementation of

`CacheManager.getCache`

***

### hasCache()

#### Call Signature

> **hasCache**(`name`): `boolean`

Returns whether the named cache exists (no creation).

##### Parameters

###### name

`string`

##### Returns

`boolean`

##### Implementation of

`CacheManager.hasCache`

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether the token-identified cache exists (no creation).

##### Parameters

###### token

[`ContextToken`](#)\<`Cache`\<`unknown`\>\>

##### Returns

`boolean`

##### Implementation of

`CacheManager.hasCache`
