[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / CacheManager

# Interface: CacheManager

Named-cache registry. The application-level seam: `@cached` resolves its
named cache through this contract (`this.cacheManager`), and a
distributed/Redis implementation can replace the in-memory manager without
touching call sites (the audit's planned extension point).

## Methods

### getCache()

> **getCache**\<`V`\>(`name`): [`Cache`](Cache.md)\<`V`\>

Returns the named cache, auto-creating it with the manager defaults
when absent.

#### Type Parameters

##### V

`V` = `unknown`

#### Parameters

##### name

`string`

Non-empty cache name.

#### Returns

[`Cache`](Cache.md)\<`V`\>

#### Throws

For a non-string or empty name.

***

### hasCache()

> **hasCache**(`name`): `boolean`

Returns whether the named cache exists (no creation).

#### Parameters

##### name

`string`

#### Returns

`boolean`
