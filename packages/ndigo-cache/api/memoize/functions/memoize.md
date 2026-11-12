[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [memoize](../README.md) / memoize

# Function: memoize()

> **memoize**\<`A`, `R`\>(`fn`, `options?`): (...`args`) => `Promise`\<`Awaited`\<`R`\>\>

Memoizes a function: results are cached by (serialized) arguments — the
client-side half of the caching story, usable in browsers and Node with no
DI or entries (unlike the [cached](../../cached/README.md) decorator, which resolves a
[CacheManager](../../cache-manager/interfaces/CacheManager.md) from the instance).

Semantics:
- **Async single-flight**: concurrent calls for the same key share one
  in-flight promise; the settled **value** is cached.
- **Rejections are never cached**: a rejected promise clears the in-flight
  slot and the next call re-invokes the function.
- Always returns a promise, including for synchronous functions. Cache
  reads and writes are awaited; backend failures reject the call.

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

(...`args`) => `Promise`\<`Awaited`\<`R`\>\>
