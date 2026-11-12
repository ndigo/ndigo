[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache-manager](../README.md) / MemoryCacheManager

# Class: MemoryCacheManager

In-memory [CacheManager](../interfaces/CacheManager.md): auto-creates [MemoryCache](../../cache/classes/MemoryCache.md) stores on
first `getCache(name)` with the manager defaults. Caches are owned for the
manager's lifetime — the auto-configuration `cacheManager` entry is a
singleton per application context.

## Implements

- [`CacheManager`](../interfaces/CacheManager.md)

## Constructors

### Constructor

> **new MemoryCacheManager**(`options?`): `MemoryCacheManager`

Creates a manager with the given defaults.

#### Parameters

##### options?

[`CacheManagerOptions`](../interfaces/CacheManagerOptions.md) = `{}`

Manager options (see [CacheManagerOptions](../interfaces/CacheManagerOptions.md)).

#### Returns

`MemoryCacheManager`

## Methods

### getCache()

Returns the cache for a name or token.

#### Param

**nameOrToken**

Cache name or typed store token.

#### Call Signature

> **getCache**\<`V`\>(`name`): [`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

Returns the named cache, auto-creating it when absent.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

The cache store.

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`getCache`](../interfaces/CacheManager.md#getcache)

#### Call Signature

> **getCache**\<`V`\>(`token`): [`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

Returns the token-identified cache, auto-creating it when absent.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>\>

The cache store token.

##### Returns

[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

The cache store.

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`getCache`](../interfaces/CacheManager.md#getcache)

***

### hasCache()

Returns whether the cache for a name or token exists.

#### Param

**nameOrToken**

Cache name or typed store token.

#### Call Signature

> **hasCache**(`name`): `boolean`

Returns whether the named cache exists (no creation).

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

`boolean`

Whether the cache exists.

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`hasCache`](../interfaces/CacheManager.md#hascache)

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether the token-identified cache exists (no creation).

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../../cache/interfaces/Cache.md)\<`unknown`\>\>

The cache store token.

##### Returns

`boolean`

Whether the cache exists.

##### Implementation of

[`CacheManager`](../interfaces/CacheManager.md).[`hasCache`](../interfaces/CacheManager.md#hascache)
