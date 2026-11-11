# Guide 19 — Caching

Caching in Ndigo has two halves sharing one store: server-side method
caching with the `@cached` decorator, and client-side (browser or Node)
function memoization with `memoize`. Both run on the same package —
`@ndigo/cache` — an isomorphic, dependency-free TTL store with LRU/FIFO
eviction.

The HTTP client's `CacheInterceptor`/`IfModifiedInterceptor` are the third
piece (client-side **HTTP** caching) — see the `ndigo-views` client demo and
the `@ndigo/http` package README; they are separate machinery with
response-specific semantics.

**Audience:** Node and browser application developers · **Prerequisites:** Workspace bootstrapped; [guide 21](21-persistence-and-shared-stores.md) for shared Redis · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)

## What you'll learn

- Use the TTL/LRU store and its miss semantics.
- Cache server methods with `@cached`.
- Memoize client functions with `memoize`.
- Invalidate entries deliberately.
- Move the same contracts onto Redis.

## 1. The store

```ts
import { MemoryCache, MemoryCacheManager, CacheMiss } from '@ndigo/cache';

const cache = new MemoryCache<string>({ defaultTtl: 60_000, maxSize: 1_000 });

await cache.set('greeting', 'hello', 30_000); // per-entry TTL overrides the default
const value = await cache.get('greeting');
if (value !== CacheMiss.INSTANCE) {
    // value: string — CacheMiss distinguishes "absent/expired" from a stored undefined
}
await cache.has('greeting'); // false once expired
await cache.delete('greeting');
await cache.clear();
const count = await cache.size(); // entry count — expiry is lazy, so expired entries may still be counted until swept; size is a method, not a property
```

All `Cache` operations are asynchronous, including the in-memory implementation:
`get(key): Promise<V | CacheMiss>`, `set(key, value, ttl?): Promise<void>`,
`has(key): Promise<boolean>`, `delete(key): Promise<boolean>`,
`clear: Promise<void>`, and `size: Promise<number>`.

- **Expiry is lazy** — expired entries are dropped on access; no timers, safe
  in browsers and workers.
- **Eviction** — `maxSize` set → the size cap evicts per `eviction`:
  `'lru'` (default; hits promote) or `'fifo'` (oldest insertion first).
  `maxSize` omitted → TTL-only, no size eviction.
- **`MemoryCacheManager`** — synchronous local named-cache handle registry:
  `getCache('users')` auto-creates a store with the manager defaults and
  returns the same instance thereafter; `hasCache('users')` checks the registry.
  Neither requires `await`. Backend operations on the returned store do.

## 2. Server: `@cached`

Mark a method and the framework caches its result (cache-aside) — no
pointcuts, no proxies: the decorator returns a wrapper that reads the
`CacheManager` off the instance (`this.cacheManager`). When that property is
absent the raw method runs (graceful degradation — unit tests see the plain
method).

```ts
import { cached } from '@ndigo/cache';
import type { CacheManager } from '@ndigo/cache';
import { getMapping, requestMapping } from '@ndigo/dispatcher';

@requestMapping('/api')
export class ProductController {
    // Server apps: NodeAutoConfiguration provisions the `cacheManager` bean;
    // resolve it with the ApplicationContextAware mixin
    cacheManager: CacheManager;

    @getMapping('/products/top')
    topProducts() {
        return this.rankedProducts();
    }

    @cached({ cacheName: 'catalog', ttl: 60_000 })
    async rankedProducts(): Promise<Product[]> {
        // invoked once per TTL window; every other call is served from cache
        return expensiveRanking();
    }
}
```

Typed cache handles: a `ContextToken`-identified store works
everywhere a cache name does — `@cached({ cache: CATALOG })` and
`cacheManager.getCache(CATALOG)` address the identical store (the token
description is the store name), so renames and store types are
compile-checked:

```ts
import { ContextToken } from '@ndigo/context';
import { cached } from '@ndigo/cache';
import type { Cache } from '@ndigo/cache';

export const CATALOG = new ContextToken<Cache<Product>>('catalog');

@cached({ cache: CATALOG, ttl: 60_000 })
async rankedProducts(): Promise<Product> { … } // await getCache(CATALOG).delete(key) for eviction
```

Semantics:

- **Promise-only methods** — decorated methods must explicitly return a
  `Promise` (use `async` even for pure computation); hits and misses both
  return promises resolving to settled values.
- **Only fulfilled results are cached** — method failures reject the call and
  are not cached; the next call retries.
- **Single-flight** — overlapping calls for a key share work scoped to the
  actual store, from backend read through computation and awaited write.
  Separate stores never share results; promise identity is not a contract.
- **Backend errors** — read failures reject without invoking the method.
  Decorator write failures emit a best-effort warning but still return the
  computed value.
- **Keys** — default: JSON-serialized arguments (`{a:1,b:2}` ≠ `{b:2,a:1}`;
  `undefined`/`null` collapse). Customize with `key` — a static string (the
  method caches one value) or a `(...args) => string` function. No SpEL —
  plain JS only.
- **Self-invocation is cached** — the wrapper replaces the prototype method,
  so `this.method` calls inside the class hit the cache too.
- **Invalidation** — TTL expiry plus manual eviction:
  `await this.cacheManager.getCache('catalog').delete('…')` or
  `await this.cacheManager.getCache('catalog').clear`.
  A `@cacheEvict` annotation is deliberately not in v1.

## 3. Client: `memoize`

Plain-function memoization for browsers and Node — no DI, no beans. The
wrapper always returns `Promise<Awaited<R>>`, even for synchronous inputs:

```ts
import { memoize } from '@ndigo/cache';

const loadUser = memoize(async (id: string) => fetch(`/users/${id}`).then((r) => r.json()), {
    ttl: 30_000,
    maxSize: 500,
});

await Promise.all([loadUser('a'), loadUser('a')]); // one fetch — single-flight
await loadUser('a'); // cache hit

const double = memoize((value: number) => value * 2);
const result = await double(21); // 42; double(21) returns Promise<number>
```

- Concurrent calls for the same key share work from cache read through
  computation and write; promise identity is not a contract.
- Rejections are never cached; the next call re-invokes. Unlike the decorator's
  best-effort writes, `memoize` propagates cache write failures.
- Options: `ttl`, `maxSize`, `eviction`, `key` (as in `@cached`).

## 4. Manual invalidation

```ts
const catalog = context.getValue<CacheManager>('cacheManager'); // server
await catalog.getCache('catalog').delete('…'); // named-entry eviction
await catalog.getCache('catalog').clear(); // whole-store eviction
```

## 5. Pitfalls

- **Shared manager, args-only keys** — two service instances sharing one
  manager cache the same arguments to the same key. Mitigate with distinct
  `cacheName`s or per-instance managers; fold instance identity into a
  custom `key` when necessary.
- **Purity contract** — cached methods/memoized functions must be
  side-effect-free from the caller's perspective: results are a pure function
  of the arguments plus the TTL window.
- **Bounded stores** — cap `maxSize` (or rely on TTL) where keys are
  user-controlled: unbounded caches grow with the key space.

Reference: [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api) (`GET /api/cached-report` demo gate, counter spec
in `app-bootstrap.spec.ts`) and the `ndigo-views` client demo (memoized
payload derivation next to the HTTP cache-hit refresh). Design rationale:
[caching decision](../decisions/2026-09-17_AD24_CACHING.md).

## 6. Shared Node cache with Redis

`@ndigo/redis/cache` supplies `RedisCacheManager` and `RedisCache` against the
same awaitable contract. The memory backend remains the framework default;
register/select a Redis manager explicitly in your application's configuration.

```ts
import { RedisCacheManager } from '@ndigo/redis/cache';

const manager = new RedisCacheManager({
    url: process.env.REDIS_URL!,
    namespace: 'catalog-app:production',
    defaults: { defaultTtl: 60_000 },
});
await manager.connect();
const catalog = manager.getCache('catalog'); // local synchronous handle lookup
await catalog.set('top', [{ id: 42 }]);
// Another manager with the same namespace/name sees the same value and expiry.
await manager.close(); // stop consumers, then await before context.close()
```

Requires Node 24+ and standalone Redis 7.2+. Values must be JSON-value trees;
whole-entry undefined is separately tagged so it is not a miss. Unsupported
objects (Date/classes/cycles/functions/bigint/nonfinite numbers, nested undefined,
accessors/sparse arrays) and corrupt stored values reject rather than silently
losing information. TTL fractions round upward to millisecond precision. With
no TTL/default, entries have no expiry. Redis uses server-side expiry; `size`
counts live namespace keys rather than memory's lazy entry count.

No per-cache `maxSize` or LRU/FIFO options are supported. Namespace-scoped SCAN
and bounded DEL/EXISTS batches implement `clear` and `size`; neither is an
atomic snapshot during concurrent writes. Namespace/cache/key components are
unambiguously encoded, and clear never runs FLUSHDB. Stop writers for stable
bulk clearing/counting. Redis maxmemory eviction is global deployment policy.

URL-created clients are owned, fail fast without reconnect/offline queues, and
are drained/closed by awaited `close`. A ready injected `{ client }` is borrowed
and keeps its application's reconnect policy; wrapper shutdown leaves it open.
Backend errors propagate (the existing `@cached` best-effort _write_ policy still
applies). The synchronous context teardown does not await async close hooks, so
await the manager before closing the context. Supply URLs/credentials through
application environment/secrets binding; the adapter never logs them or
connects automatically to localhost. See the [Redis package README](../../packages/ndigo-redis/README.md)
for the full codec, failure, ACL, lifecycle and live verification contracts.

## See also

- [Guide 45 — Performance & Scaling](45-performance-and-scaling.md) — measuring cache impact
- [Guide 11 — The HTTP Client](11-http-client.md) — HTTP caching interceptors
- [Guide 21 — Persistence & Shared Stores](21-persistence-and-shared-stores.md) — the Redis cache
- [`@ndigo/cache`](../../packages/ndigo-cache/README.md) — the store contract
