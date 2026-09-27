[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / CachedSpec

# Interface: CachedSpec

User-supplied `@cached` specification.

## Properties

### cacheName?

> `optional` **cacheName?**: `string`

Named cache under the instance's [CacheManager](CacheManager.md). Defaults to
[DEFAULT\_CACHE\_NAME](../variables/DEFAULT_CACHE_NAME.md). A shared manager isolates domains by name;
a per-instance manager isolates by instance.

***

### key?

> `optional` **key?**: `string` \| ((...`args`) => `string`)

Cache key: a static string (the method caches a single value), a
`(...args) => string` function, or omitted (defaults to JSON-serialized
arguments — JSON semantics: `undefined`/`null` collapse, object
insertion order significant). No expression language (D-5).

***

### ttl?

> `optional` **ttl?**: `number`

Entry lifetime in milliseconds; the named cache's default applies when
omitted. Entries are never invalidated automatically beyond TTL —
manual eviction is `cacheManager.getCache(name).delete/clear`.
