[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-resolver](../README.md) / BoundedCache

# Class: BoundedCache\<V\>

Insertion-ordered, bounded FIFO cache.

Shared by every view resolver that memoizes request-derived lookups
([AbstractCachingViewResolver](AbstractCachingViewResolver.md) and `ContentNegotiationViewResolver`)
so the eviction contract is defined once: never more than
[MAX\_VIEW\_CACHE\_ENTRIES](../variables/MAX_VIEW_CACHE_ENTRIES.md) entries, the oldest key evicted first.

## Type Parameters

### V

`V`

## Constructors

### Constructor

> **new BoundedCache**\<`V`\>(): `BoundedCache`\<`V`\>

#### Returns

`BoundedCache`\<`V`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Number of cached entries.

##### Returns

`number`

## Methods

### get()

> **get**(`key`): `V` \| `undefined`

Looks up a cached value.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`V` \| `undefined`

The cached value, or `undefined`.

***

### set()

> **set**(`key`, `value`): `void`

Stores a value, evicting the oldest entry first when a new key would
exceed the bound. Re-setting an existing key keeps its position.

#### Parameters

##### key

`string`

The cache key.

##### value

`V`

The value to cache.

#### Returns

`void`

***

### toObject()

> **toObject**(): `object`

A null-prototype plain object mirror of the cache entries, preserving
insertion order.

#### Returns

`object`

The entries as a keyed object.
