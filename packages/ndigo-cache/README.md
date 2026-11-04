# @ndigo/cache

> Caching for Ndigo — an in-memory TTL store and manager, client-side memoization, and the server-side `@cached` decorator.

`@ndigo/cache` covers both halves of the caching story: `MemoryCache` and
`MemoryCacheManager` for server-side stores (the default framework cache),
`memoize` for browsers and Node clients, and `@cached` as the
container-friendly decorator that resolves a `CacheManager` off the instance.

- **`Cache` / `CacheMiss` / `MemoryCache`** — awaitable store: TTL expiry
  (lazy, timer-free), bounded-size eviction (Map-order LRU default, `fifo`
  option), and a branded miss sentinel that makes a stored `undefined`
  distinguishable from "absent/expired".
- **`CacheManager` / `MemoryCacheManager`** — named-cache registry:
  `getCache('users')` auto-creates with manager defaults and returns the same
  instance thereafter. This is the store-resolution seam `@cached` uses;
  distributed managers implement the same contract.
- **`memoize(fn, { ttl, maxSize, eviction, key })`** — client-side
  memoization for browsers and Node, no DI: JSON-arg keys, async
  single-flight coalescing, fulfilled-results-only caching.
- **`@cached({ cacheName, key, ttl })`** — the server-side decorator: a
  wrapper (no AOP) that reads `this.cacheManager`, degrades gracefully to the
  raw method when absent, caches fulfilled results only, and records its spec
  under `cache:<method>` metadata (read via `getCachedSpec`).

## Installation

```bash
pnpm add @ndigo/cache
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { CacheMiss, MemoryCache, MemoryCacheManager } from '@ndigo/cache';

const cache = new MemoryCache<string>({ defaultTtl: 60_000, maxSize: 1_000 });
await cache.set('k', 'v');
(await cache.get('k')) !== CacheMiss.INSTANCE; // hit

const manager = new MemoryCacheManager({ defaults: { defaultTtl: 30_000 } });
await manager.getCache('users').set('a', { id: 'a' });
```

## Usage

### Semantics

All cache data operations return promises: `get`, `set`, `has`, `delete`,
`clear`, and `size()`. `CacheManager` remains a synchronous local handle
registry — `getCache` acquires a handle without performing data I/O.
`memoize` always returns an awaitable function, even for a sync input.
`@cached` methods must declare a Promise return type. Single-flight covers
backend reads, computation, and completed writes; backend read errors reject,
while decorator write errors are logged and the computed result is returned
(the best-effort write policy). There is no synchronous cache compatibility
API.

### Memory cache

- **Expiry is lazy**: expired entries are removed on `get`/`has` access, never
  by a background sweep — no timers, safe in browsers and workers.
- **Eviction** is configured per store with `maxSize` and `eviction` (`lru`
  default, evicting the least-recently-used entry; `fifo`, evicting the
  oldest-inserted entry regardless of access or update).
- `CacheMiss.INSTANCE` distinguishes "no value cached" from a cached
  `undefined` — compare with `=== CacheMiss.INSTANCE` or `isCacheMiss(value)`.
  `set` rejects the sentinel as a value and a non-positive/non-finite TTL with
  a `TypeError`.
- `defaultTtl`, `maxSize`, and `eviction` are fixed at construction — a
  shared instance has uniform behavior; configure per named cache through
  `MemoryCacheManager` defaults.

### Named caches and typed tokens

`getCache(name)` auto-creates the named cache with the manager defaults on
first use and returns the same instance thereafter (non-empty string
required). `getCache(ContextToken<Cache<V>>)` uses the token description as
the name, exactly as the string form does. The `CACHE_MANAGER` token resolves
the shared manager bean: `context.getValue(CACHE_MANAGER)`. `hasCache` checks
only the local registry — it neither creates nor performs I/O.

### Client-side memoization

```ts
import { memoize } from '@ndigo/cache';

const load = memoize(async (id: string) => fetchUser(id), { ttl: 30_000, maxSize: 100 });
```

Arguments are keyed with `serializeCacheKey` (JSON of the argument array) by
default; pass `key` for custom semantics. Concurrent calls for the same key
share one in-flight promise, and only fulfilled results are stored —
rejections free the slot and the next call re-invokes the function.
`serializeCacheKeyStrict` is available when JSON semantics would merge
distinct values (`undefined`/`null`, `1`/`'1'`).

### The `@cached` decorator

```ts
import { cached, type CacheManager } from '@ndigo/cache';

class UserService {
    cacheManager: CacheManager; // the platform's cacheManager entry, injected in a Node app

    @cached({ cacheName: 'users', ttl: 30_000 })
    async byId(id: string): Promise<User> {
        /* … */
    }
}
```

The decorator returns a wrapper (no AOP) that resolves `this.cacheManager`;
without a manager it calls the raw method (caching disabled, the method stays
async). Hits return the stored settled value; misses call the target and store
the result. Fulfilled results only — method rejections propagate and are never
stored. Single-flight spans the backend read, the computation, and the awaited
write; self-invocation through `this.method()` **is** cached. The normalized
spec is recorded under `cache:<method>` metadata and can be read with
`getCachedSpec(target, methodName)`.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of Ndigo.

- `Cache`, `CacheOptions`, `CacheMiss`, `isCacheMiss`, `MemoryCache`
- `CacheManager`, `CacheManagerOptions`, `MemoryCacheManager`, `CACHE_MANAGER`
- `memoize`, `MemoizeOptions`
- `cached`, `CachedSpec`, `NormalizedCachedSpec`, `resolveCachedSpec`,
  `getCachedSpec`, `CACHED_METADATA_PREFIX`, `DEFAULT_CACHE_NAME`
- `serializeCacheKey`, `serializeCacheKeyStrict`

## Development

```bash
pnpm --filter @ndigo/cache build:lib
pnpm --filter @ndigo/cache test
```

## See Also

- [Guide 07 — Caching](../../docs/guides/07-caching.md) — the server decorator, client memoization, invalidation, and pitfalls

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
