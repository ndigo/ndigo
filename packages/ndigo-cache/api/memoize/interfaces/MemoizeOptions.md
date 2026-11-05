[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [memoize](../README.md) / MemoizeOptions

# Interface: MemoizeOptions\<A\>

Options for [memoize](../functions/memoize.md).

## Type Parameters

### A

`A` *extends* `unknown`[] = `unknown`[]

## Properties

### eviction?

> `optional` **eviction?**: `"lru"` \| `"fifo"`

Eviction policy when `maxSize` is set — `lru` (default) or `fifo`.

***

### key?

> `optional` **key?**: (...`args`) => `string`

Custom key function over the arguments. Defaults to JSON-serialized
arguments (see [serializeCacheKey](../../keys/functions/serializeCacheKey.md)).

#### Parameters

##### args

...`A`

#### Returns

`string`

***

### maxSize?

> `optional` **maxSize?**: `number`

Maximum memoized entries before eviction (see
[CacheOptions.maxSize](../../cache/interfaces/CacheOptions.md#maxsize)).

***

### ttl?

> `optional` **ttl?**: `number`

Entry lifetime in milliseconds (passed as the store default TTL).
Omitted = entries live until evicted or cleared.
