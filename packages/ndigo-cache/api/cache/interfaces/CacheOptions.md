[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache](../README.md) / CacheOptions

# Interface: CacheOptions

Configuration for a [MemoryCache](../classes/MemoryCache.md) store.

## Properties

### defaultTtl?

> `optional` **defaultTtl?**: `number`

Default lifetime in milliseconds for entries set without an explicit
TTL. Omitted (or `0`) = entries live until evicted or cleared.

***

### eviction?

> `optional` **eviction?**: `"lru"` \| `"fifo"`

Size-limit eviction policy when [maxSize](#maxsize) is
set: `lru` (default) evicts the least-recently-used entry (get and set
hits promote it), `fifo` evicts the oldest-inserted entry regardless of
access or update.

***

### maxSize?

> `optional` **maxSize?**: `number`

Maximum number of entries before eviction. Omitted (or `0`) = no size
eviction — entries are bounded only by [CacheOptions.defaultTtl](#defaultttl)
and explicit deletes. Default: no size bound.
