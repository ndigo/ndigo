/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { CacheMiss, MemoryCache } from './cache';
import { isPromiseLike, serializeCacheKey } from './keys';

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
     * {@link CacheOptions.maxSize}).
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
 * DI or beans (unlike the {@link cached} decorator, which resolves a
 * {@link CacheManager} from the instance).
 *
 * Semantics:
 * - **Async single-flight**: concurrent calls for the same key share one
 *   in-flight promise; the settled **value** is cached.
 * - **Rejections are never cached**: a rejected promise clears the in-flight
 *   slot and the next call re-invokes the function.
 * - The wrapped function must be consistently sync or async; the mode is
 *   recorded from the first computed call and governs how cache hits are
 *   returned (settled value vs. resolved promise).
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
): (...args: A) => R {
    const cache = new MemoryCache<unknown>({
        defaultTtl: options.ttl,
        maxSize: options.maxSize,
        eviction: options.eviction,
    });
    const inflight = new Map<string, Promise<unknown>>();
    const keyOf = options.key ?? serializeCacheKey;
    let asyncMode: 'sync' | 'async' | undefined;

    return (...args: A): R => {
        const key = keyOf(...args);

        const pending = inflight.get(key);
        if (pending !== undefined) {
            return pending as R;
        }

        const hit = cache.get(key);
        if (hit !== CacheMiss.INSTANCE) {
            // A hit under async mode holds the settled value, not a promise.
            return asyncMode === 'async' ? (Promise.resolve(hit) as R) : (hit as R);
        }

        const result = fn(...args);
        if (isPromiseLike(result)) {
            if (asyncMode === undefined) {
                asyncMode = 'async';
            }
            const promise = Promise.resolve(result);
            inflight.set(key, promise);
            void promise.then(
                (resolved) => {
                    inflight.delete(key);
                    cache.set(key, resolved, options.ttl);
                },
                () => {
                    inflight.delete(key); // never cache rejections
                }
            );
            return promise as R;
        }

        if (asyncMode === undefined) {
            asyncMode = 'sync';
        }
        cache.set(key, result, options.ttl);
        return result;
    };
}
