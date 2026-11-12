/**
 * In-memory memoization over the cache contract.
 */
import { CacheMiss, MemoryCache } from './cache';
import { serializeCacheKey } from './keys';

/**
 * Options for {@link memoize}.
 */
export interface MemoizeOptions<A extends unknown[] = unknown[]> {
    /**
     * Entry lifetime in milliseconds (passed as the store default TTL).
     * Omitted = entries live until evicted or cleared.
     */
    ttl?: number;
    /**
     * Maximum memoized entries before eviction (see
     * {@link cache.CacheOptions#maxSize | CacheOptions.maxSize}).
     */
    maxSize?: number;
    /**
     * Eviction policy when `maxSize` is set — `lru` (default) or `fifo`.
     */
    eviction?: 'lru' | 'fifo';
    /**
     * Custom key function over the arguments. Defaults to JSON-serialized
     * arguments (see {@link serializeCacheKey}).
     */
    key?: (...args: A) => string;
}

/**
 * Memoizes a function: results are cached by (serialized) arguments — the
 * client-side half of the caching story, usable in browsers and Node with no
 * DI or entries (unlike the {@link cached} decorator, which resolves a
 * {@link "cache-manager".CacheManager | CacheManager} from the instance).
 *
 * Semantics:
 * - **Async single-flight**: concurrent calls for the same key share one
 *   in-flight promise; the settled **value** is cached.
 * - **Rejections are never cached**: a rejected promise clears the in-flight
 *   slot and the next call re-invokes the function.
 * - Always returns a promise, including for synchronous functions. Cache
 *   reads and writes are awaited; backend failures reject the call.
 *
 * @param fn - The function to memoize (documented contract: no side effects
 *   the caller relies on — results must be a pure function of the arguments
 *   plus the TTL).
 * @param options - Cache behavior (see {@link MemoizeOptions}).
 * @returns The memoized function.
 */
export function memoize<A extends unknown[], R>(
    fn: (...args: A) => R,
    options: MemoizeOptions = {}
): (...args: A) => Promise<Awaited<R>> {
    const cache = new MemoryCache<Awaited<R>>({
        defaultTtl: options.ttl,
        maxSize: options.maxSize,
        eviction: options.eviction,
    });
    const inflight = new Map<string, Promise<Awaited<R>>>();
    const keyOf = options.key ?? serializeCacheKey;

    return async (...args: A): Promise<Awaited<R>> => {
        const key = keyOf(...args);
        const pending = inflight.get(key);
        if (pending !== undefined) return pending;

        const work = (async (): Promise<Awaited<R>> => {
            const hit = await cache.get(key);
            if (hit !== CacheMiss.INSTANCE) return hit as Awaited<R>;
            const result = await fn(...args);
            await cache.set(key, result, options.ttl);
            return result;
        })();
        inflight.set(key, work);
        try {
            return await work;
        } finally {
            inflight.delete(key);
        }
    };
}
