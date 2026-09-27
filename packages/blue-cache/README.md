# @blue/cache

Caching for BlueJS — one isomorphic, dependency-free package for both sides
of the stack:

- **`Cache` / `CacheMiss` / `MemoryCache`** — the store: TTL expiry (lazy,
  timer-free), bounded-size eviction (Map-order LRU default, `fifo`
  option), and a branded miss sentinel that makes a stored `undefined`
  distinguishable from "absent/expired".
- **`CacheManager` / `MemoryCacheManager`** — named-cache registry:
  `getCache('users')` auto-creates with manager defaults and returns the
  same instance thereafter. The resolution seam `@cached` uses, and the
  plug point for a future distributed store.
- **`memoize(fn, { ttl, maxSize, eviction, key })`** — client-side
  memoization for browsers and Node, no DI: JSON-arg keys, async
  single-flight coalescing, fulfilled-results-only caching.
- **`@cached({ cacheName, key, ttl })`** — the server-side decorator: a
  wrapper (no AOP) that reads `this.cacheManager`, degrades gracefully to
  the raw method when absent, caches fulfilled results only, and records its
  spec under `cache:<method>` metadata (read via `getCachedSpec`).

## Quickstart

```ts
import { MemoryCache, MemoryCacheManager, memoize, cached, CacheMiss } from '@blue/cache';

const cache = new MemoryCache<string>({ defaultTtl: 60_000, maxSize: 1_000 });
cache.set('k', 'v');
cache.get('k') !== CacheMiss.INSTANCE; // hit

const manager = new MemoryCacheManager({ defaults: { defaultTtl: 30_000 } });
manager.getCache('users').set('a', { id: 'a' });

const load = memoize(async (id: string) => fetchUser(id), { ttl: 30_000 });

class UserService {
    cacheManager: CacheManager; // injected in a Node app; see guide 07

    @cached({ cacheName: 'users', ttl: 30_000 })
    async byId(id: string): Promise<User> {
        /* … */
    }
}
```

## Primary exports

- `Cache`, `CacheOptions`, `CacheMiss`, `isCacheMiss`, `MemoryCache`
- `CacheManager`, `CacheManagerOptions`, `MemoryCacheManager`
- `memoize`, `MemoizeOptions`
- `cached`, `CachedSpec`, `NormalizedCachedSpec`, `resolveCachedSpec`,
  `getCachedSpec`, `CACHED_METADATA_PREFIX`, `DEFAULT_CACHE_NAME`
- `serializeCacheKey`, `isPromiseLike`

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

## Docs

- Guide: [`docs/guides/07-caching.md`](../../docs/guides/07-caching.md) —
  server decorator, client memoization, invalidation, pitfalls.
