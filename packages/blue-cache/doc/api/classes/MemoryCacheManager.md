[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / MemoryCacheManager

# Class: MemoryCacheManager

In-memory [CacheManager](../interfaces/CacheManager.md): auto-creates [MemoryCache](MemoryCache.md) stores on
first `getCache(name)` with the manager defaults. Caches are owned for the
manager's lifetime — the auto-configuration `cacheManager` bean is a
singleton per application context.

## Implements

- [`CacheManager`](../interfaces/CacheManager.md)

## Constructors

### Constructor

> **new MemoryCacheManager**(`options?`): `MemoryCacheManager`

#### Parameters

##### options?

[`CacheManagerOptions`](../interfaces/CacheManagerOptions.md) = `{}`

Manager options (see [CacheManagerOptions](../interfaces/CacheManagerOptions.md)).

#### Returns

`MemoryCacheManager`

## Methods

### getCache()

#### Call Signature

> **getCache**\<`V`\>(`name`): [`Cache`](../interfaces/Cache.md)\<`V`\>

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

[`Cache`](../interfaces/Cache.md)\<`V`\>

##### Throws

For a non-string or empty name.

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`getCache`](../interfaces/CacheManager.md#getcache)

#### Call Signature

> **getCache**\<`V`\>(`token`): [`Cache`](../interfaces/Cache.md)\<`V`\>

Returns the cache identified by a typed store token (AD-34 D7) —
description-backed, same store as the string form.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../interfaces/Cache.md)\<`V`\>\>

The cache store token.

##### Returns

[`Cache`](../interfaces/Cache.md)\<`V`\>

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`getCache`](../interfaces/CacheManager.md#getcache)

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

[`CacheManager`](../interfaces/CacheManager.md).[`hasCache`](../interfaces/CacheManager.md#hascache)

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether the token-identified cache exists (no creation).

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../interfaces/Cache.md)\<`unknown`\>\>

##### Returns

`boolean`

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`hasCache`](../interfaces/CacheManager.md#hascache)
