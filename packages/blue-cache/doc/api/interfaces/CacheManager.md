[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / CacheManager

# Interface: CacheManager

Named-cache registry. Acquires local backend handles synchronously without
performing data I/O; the returned Cache operations are awaited. `@cached`
resolves its named cache through this contract (`this.cacheManager`).

## Methods

### getCache()

#### Call Signature

> **getCache**\<`V`\>(`name`): [`Cache`](Cache.md)\<`V`\>

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

[`Cache`](Cache.md)\<`V`\>

##### Throws

For a non-string or empty name.

#### Call Signature

> **getCache**\<`V`\>(`token`): [`Cache`](Cache.md)\<`V`\>

Returns the cache identified by a typed store token (AD-34 D7) —
description-backed, same store as the string form.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

`ContextToken`\<[`Cache`](Cache.md)\<`V`\>\>

The cache store token.

##### Returns

[`Cache`](Cache.md)\<`V`\>

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

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether the token-identified cache exists (no creation).

##### Parameters

###### token

`ContextToken`\<[`Cache`](Cache.md)\<`unknown`\>\>

##### Returns

`boolean`
