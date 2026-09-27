[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / cached

# Function: cached()

> **cached**(`spec?`): \<`This`, `Args`, `Return`\>(`value`, `context`) => (`this`, ...`args`) => `Return`

Marks a method as cached (AD-24). The non-AOP interception mechanism
mirrors `@transactional`: the decorator returns a wrapper that resolves
the [CacheManager](../interfaces/CacheManager.md) off the instance (`this.cacheManager`), calling
the raw method when absent — graceful degradation, so unit tests without a
cache see the plain method.

Semantics:
- **Hits** return the stored settled value; **misses** call the target and
  store the result.
- **Fulfilled results only**: method rejections/throws propagate to the
  caller and are never stored — the in-flight slot is freed and the next
  call retries.
- **Async methods** return a promise callers await; the cache is written on
  settle. Concurrent misses for the same key are coalesced behind one
  in-flight computation (single-flight, mirroring [memoize](memoize.md)): only the
  first caller invokes the target while it is pending. A cache write that
  throws is logged and swallowed so a caching failure never breaks or hides
  the primary result (S2).
- Self-invocation through `this.method()` **is** cached: the wrapper
  replaces the prototype method (stronger than Spring proxy semantics,
  where self-invocation bypasses the cache).

## Parameters

### spec?

[`CachedSpec`](../interfaces/CachedSpec.md) = `{}`

Cache selection/key/TTL (see [CachedSpec](../interfaces/CachedSpec.md)).

## Returns

The class method decorator.

\<`This`, `Args`, `Return`\>(`value`, `context`) => (`this`, ...`args`) => `Return`
