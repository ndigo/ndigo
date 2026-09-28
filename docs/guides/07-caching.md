# Guide 07 — Caching

Caching in BlueJS has two halves sharing one store: server-side method
caching with the `@cached` decorator, and client-side (browser or Node)
function memoization with `memoize`. Both run on the same package —
`@blue/cache` — an isomorphic, dependency-free TTL store with LRU/FIFO
eviction.

The HTTP client's `CacheInterceptor`/`IfModifiedInterceptor` are the third
piece (client-side **HTTP** caching) — see the `blue-views` client demo and
the `@blue/http` package README; they are separate machinery with
response-specific semantics.

## 1. The store

```ts
import { MemoryCache, MemoryCacheManager, CacheMiss } from '@blue/cache';

const cache = new MemoryCache<string>({ defaultTtl: 60_000, maxSize: 1_000 });

cache.set('greeting', 'hello', 30_000); // per-entry TTL overrides the default
const value = cache.get('greeting');
if (value !== CacheMiss.INSTANCE) {
    // value: string — CacheMiss distinguishes "absent/expired" from a stored undefined
}
cache.has('greeting'); // false once expired
cache.delete('greeting');
cache.clear();
```

- **Expiry is lazy** — expired entries are dropped on access; no timers, safe
  in browsers and workers.
- **Eviction** — `maxSize` set → the size cap evicts per `eviction`:
  `'lru'` (default; hits promote) or `'fifo'` (oldest insertion first).
  `maxSize` omitted → TTL-only, no size eviction.
- **`MemoryCacheManager`** — named-cache registry: `getCache('users')`
  auto-creates a store with the manager defaults and returns the same
  instance thereafter. This is the seam `@cached` resolves through, and the
  plug point for a future distributed store.

## 2. Server: `@cached`

Mark a method and the framework caches its result (cache-aside) — no
pointcuts, no proxies: the decorator returns a wrapper that reads the
`CacheManager` off the instance (`this.cacheManager`). When that property is
absent the raw method runs (graceful degradation — unit tests see the plain
method).

```ts
import { cached } from '@blue/cache';
import type { CacheManager } from '@blue/cache';
import { getMapping, requestMapping } from '@blue/dispatcher';

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
    rankedProducts() {
        // invoked once per TTL window; every other call is served from cache
        return expensiveRanking();
    }
}
```

Typed cache handles (AD-34 D7): a `ContextToken`-identified store works
everywhere a cache name does — `@cached({ cache: CATALOG })` and
`cacheManager.getCache(CATALOG)` address the identical store (the token
description is the store name), so renames and store types are
compile-checked:

```ts
import { ContextToken } from '@blue/context';
import { cached } from '@blue/cache';
import type { Cache } from '@blue/cache';

export const CATALOG = new ContextToken<Cache<string, Product>>('catalog');

@cached({ cache: CATALOG, ttl: 60_000 })
rankedProducts(): Product { … }   // getCache(CATALOG).delete(key) for eviction
```

Semantics:

- **Hits** return the stored settled value; **misses** call the method.
- **Only fulfilled results are cached** — a throwing/rejecting method
  propagates the error and the next call retries. (Deliberate: unlike HTTP
  caching, method caching never stores failures.)
- **Async methods** return the live promise; the settled value is written
  when it resolves.
- **Keys** — default: JSON-serialized arguments (`{a:1,b:2}` ≠ `{b:2,a:1}`;
  `undefined`/`null` collapse). Customize with `key` — a static string (the
  method caches one value) or a `(...args) => string` function. No SpEL —
  plain JS only.
- **Self-invocation is cached** — the wrapper replaces the prototype method,
  so `this.method()` calls inside the class hit the cache too.
- **Invalidation** — TTL expiry plus manual eviction:
  `this.cacheManager.getCache('catalog').delete('…')` or `.clear()`.
  A `@cacheEvict` annotation is deliberately not in v1.

## 3. Client: `memoize`

Plain-function memoization for browsers and Node — no DI, no beans, same
semantics as the decorator:

```ts
import { memoize } from '@blue/cache';

const loadUser = memoize(async (id: string) => fetch(`/users/${id}`).then((r) => r.json()), {
    ttl: 30_000,
    maxSize: 500,
});

await Promise.all([loadUser('a'), loadUser('a')]); // one fetch — single-flight
await loadUser('a'); // cache hit
```

- Concurrent calls for the same key share one in-flight promise.
- Rejections are never cached; the next call re-invokes.
- Options: `ttl`, `maxSize`, `eviction`, `key` (as in `@cached`).

## 4. Manual invalidation

```ts
const catalog = context.getValue<CacheManager>('cacheManager'); // server
catalog.getCache('catalog').delete('…'); // named-entry eviction
catalog.getCache('catalog').clear(); // whole-store eviction
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

Reference: `apps/blue-api` (`GET /api/cached-report` demo gate, counter spec
in `app-bootstrap.spec.ts`) and the `blue-views` client demo (memoized
payload derivation next to the HTTP cache-hit refresh). Design rationale:
[caching decision](../decisions/2026-09-17_AD24_CACHING.md).
