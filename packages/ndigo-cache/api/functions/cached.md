[**@ndigo/cache v0.0.1**](../README.md)

***

[@ndigo/cache](../README.md) / cached

# Function: cached()

> **cached**(`spec?`): \<`This`, `Args`, `Return`\>(`value`, `context`) => (`this`, ...`args`) => `Promise`\<`Return`\>

Marks a method as cached (AD-24). The non-AOP interception mechanism
mirrors `@transactional`: the decorator returns a wrapper that resolves
the [CacheManager](../interfaces/CacheManager.md) off the instance (`this.cacheManager`), calling
the raw method when absent — caching is disabled, but the method remains
async. Decorated methods must declare a Promise return type.

Semantics:
- **Hits** return the stored settled value; **misses** call the target and
  store the result.
- **Fulfilled results only**: method rejections/throws propagate to the
  caller and are never stored — the in-flight slot is freed and the next
  call retries.
- **Single-flight** spans backend read, computation and awaited write.
  Concurrent calls for the same store/key share one computation. Cache
  read failures reject; write failures are logged and the computed result
  is returned (the existing best-effort write policy).
- Self-invocation through `this.method()` **is** cached: the wrapper
  replaces the prototype method (stronger than Spring proxy semantics,
  where self-invocation bypasses the cache).

## Parameters

### spec?

[`CachedSpec`](../interfaces/CachedSpec.md) = `{}`

Cache selection/key/TTL (see [CachedSpec](../interfaces/CachedSpec.md)).

## Returns

The class method decorator.

\<`This`, `Args`, `Return`\>(`value`, `context`) => (`this`, ...`args`) => `Promise`\<`Return`\>
