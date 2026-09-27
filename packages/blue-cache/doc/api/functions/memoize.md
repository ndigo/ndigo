[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / memoize

# Function: memoize()

> **memoize**\<`A`, `R`\>(`fn`, `options?`): (...`args`) => `R`

Memoizes a function: results are cached by (serialized) arguments — the
client-side half of the caching story, usable in browsers and Node with no
DI or beans (unlike the [cached](cached.md) decorator, which resolves a
[CacheManager](../interfaces/CacheManager.md) from the instance).

Semantics:
- **Async single-flight**: concurrent calls for the same key share one
  in-flight promise; the settled **value** is cached.
- **Rejections are never cached**: a rejected promise clears the in-flight
  slot and the next call re-invokes the function.
- The wrapped function must be consistently sync or async; the mode is
  recorded from the first computed call and governs how cache hits are
  returned (settled value vs. resolved promise).

## Type Parameters

### A

`A` *extends* `unknown`[]

### R

`R`

## Parameters

### fn

(...`args`) => `R`

The function to memoize (documented contract: no side effects
  the caller relies on — results must be a pure function of the arguments
  plus the TTL).

### options?

[`MemoizeOptions`](../interfaces/MemoizeOptions.md) = `{}`

Cache behavior (see [MemoizeOptions](../interfaces/MemoizeOptions.md)).

## Returns

The memoized function.

(...`args`) => `R`
