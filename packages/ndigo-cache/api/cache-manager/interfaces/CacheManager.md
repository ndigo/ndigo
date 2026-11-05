[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache-manager](../README.md) / CacheManager

# Interface: CacheManager

Named-cache registry. Acquires local backend handles synchronously without
performing data I/O; the returned Cache operations are awaited. `@cached`
resolves its named cache through this contract (`this.cacheManager`).

## Methods

### getCache()

#### Call Signature

> **getCache**\<`V`\>(`name`): [`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

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

[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

##### Throws

For a non-string or empty name.

#### Call Signature

> **getCache**\<`V`\>(`token`): [`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

Returns the cache identified by a typed store token (AD-34 D7) —
description-backed, same store as the string form.

##### Type Parameters

###### V

`V` = `unknown`

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>\>

The cache store token.

##### Returns

[`Cache`](../../cache/interfaces/Cache.md)\<`V`\>

***

### hasCache()

#### Call Signature

> **hasCache**(`name`): `boolean`

Returns whether the named cache exists (no creation).

##### Parameters

###### name

`string`

Non-empty cache name.

##### Returns

`boolean`

##### Throws

For a non-string or empty name.

#### Call Signature

> **hasCache**(`token`): `boolean`

Returns whether the token-identified cache exists (no creation).

##### Parameters

###### token

[`ContextToken`](#)\<[`Cache`](../../cache/interfaces/Cache.md)\<`unknown`\>\>

The cache store token.

##### Returns

`boolean`

##### Throws

For an empty token description.
