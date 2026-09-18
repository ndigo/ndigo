/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { CacheMiss } from './cache';
import type { CacheManager } from './cache-manager';
import { isPromiseLike, serializeCacheKey } from './keys';

/**
 * Metadata key prefix under which `@cached` writes its per-method spec —
 * `cache:<methodName>` (mirror of `@scheduled`'s `schedule:` prefix).
 */
export const CACHED_METADATA_PREFIX = 'cache:';

/**
 * The named cache used when a spec omits `cacheName`.
 */
export const DEFAULT_CACHE_NAME = 'default';

/**
 * User-supplied `@cached` specification.
 */
export interface CachedSpec {
    /**
     * Named cache under the instance's {@link CacheManager}. Defaults to
     * {@link DEFAULT_CACHE_NAME}. A shared manager isolates domains by name;
     * a per-instance manager isolates by instance.
     */
    cacheName?: string;
    /**
     * Cache key: a static string (the method caches a single value), a
     * `(...args) => string` function, or omitted (defaults to JSON-serialized
     * arguments — JSON semantics: `undefined`/`null` collapse, object
     * insertion order significant). No expression language (D-5).
     */
    key?: string | ((...args: unknown[]) => string);
    /**
     * Entry lifetime in milliseconds; the named cache's default applies when
     * omitted. Entries are never invalidated automatically beyond TTL —
     * manual eviction is `cacheManager.getCache(name).delete/clear`.
     */
    ttl?: number;
}

/**
 * Canonical `@cached` specification: validated by
 * {@link resolveCachedSpec} at decoration time and recorded on
 * `Symbol.metadata` for introspection.
 */
export interface NormalizedCachedSpec {
    cacheName: string;
    key: string | ((...args: unknown[]) => string) | undefined;
    ttl: number | undefined;
}

/**
 * Normalizes and validates a {@link CachedSpec}. Throws at decoration time
 * for malformed specs — in any environment importing the module (the browser
 * included), mirroring `resolveScheduledSpec` (AD-20 D5.2).
 *
 * @param spec - The supplied spec.
 * @returns The normalized spec record.
 */
export function resolveCachedSpec(spec: CachedSpec = {}): NormalizedCachedSpec {
    if (spec === null || typeof spec !== 'object') {
        throw new TypeError(`@cached: expected a spec object — got ${spec === null ? 'null' : typeof spec}`);
    }
    const cacheName = spec.cacheName ?? DEFAULT_CACHE_NAME;
    const { key, ttl } = spec;
    if (typeof cacheName !== 'string' || cacheName.length === 0) {
        throw new TypeError(`@cached: cacheName must be a non-empty string — got ${String(cacheName)}`);
    }
    if (key !== undefined && typeof key !== 'string' && typeof key !== 'function') {
        throw new TypeError(`@cached: key must be a string or a (...args) => string function — got ${typeof key}`);
    }
    if (ttl !== undefined && (typeof ttl !== 'number' || !Number.isFinite(ttl) || ttl <= 0)) {
        throw new TypeError(`@cached: ttl must be a positive number of milliseconds — got ${String(ttl)}`);
    }
    return { cacheName, key, ttl };
}

/**
 * Marks a method as cached (AD-24). The non-AOP interception mechanism
 * mirrors `@transactional`: the decorator returns a wrapper that resolves
 * the {@link CacheManager} off the instance (`this.cacheManager`), calling
 * the raw method when absent — graceful degradation, so unit tests without a
 * cache see the plain method.
 *
 * Semantics:
 * - **Hits** return the stored settled value; **misses** call the target and
 *   store the result.
 * - **Fulfilled results only**: method rejections/throws propagate to the
 *   caller and are never stored — the next call retries.
 * - **Async methods** return the live promise (callers await the same
 *   computation); the cache is written on settle. No single-flight
 *   coalescing in v1 (see {@link memoize}); concurrent callers for a just-
 *   expired key both invoke the target, one write wins — safe, slightly
 *   redundant.
 * - Self-invocation through `this.method()` **is** cached: the wrapper
 *   replaces the prototype method (stronger than Spring proxy semantics,
 *   where self-invocation bypasses the cache).
 *
 * @param spec - Cache selection/key/TTL (see {@link CachedSpec}).
 * @returns The class method decorator.
 */
export function cached(spec: CachedSpec = {}) {
    const normalized = resolveCachedSpec(spec);

    return function <This, Args extends unknown[], Return>(
        value: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ): (this: This, ...args: Args) => Return {
        if (context.kind !== 'method') {
            throw new TypeError(`@cached can only be applied to a method — received '${context.kind}'.`);
        }
        context.metadata[`${CACHED_METADATA_PREFIX}${String(context.name)}`] = normalized;

        let asyncMode: 'sync' | 'async' | undefined;

        return function (this: This, ...args: Args): Return {
            // Structural contract, mirroring `@transactional`: the decorated
            // instance optionally carries the manager (constructor-injected);
            // absent → graceful call-through.
            const cacheAware = this as unknown as { cacheManager?: CacheManager };
            const manager = cacheAware.cacheManager;
            if (!manager) {
                return value.apply(this, args);
            }

            const store = manager.getCache<unknown>(normalized.cacheName);
            const key =
                typeof normalized.key === 'string'
                    ? normalized.key
                    : normalized.key
                      ? normalized.key(...args)
                      : serializeCacheKey(...args);

            const hit: unknown = store.get(key);
            if (hit === CacheMiss.INSTANCE) {
                const result = value.apply(this, args);
                if (isPromiseLike(result)) {
                    if (asyncMode === undefined) {
                        asyncMode = 'async';
                    }
                    void Promise.resolve(result).then(
                        (resolved) => {
                            store.set(key, resolved, normalized.ttl);
                        },
                        () => undefined // rejections are never cached; the caller's await still rejects
                    );
                } else {
                    if (asyncMode === undefined) {
                        asyncMode = 'sync';
                    }
                    store.set(key, result, normalized.ttl);
                }
                return result;
            }

            // Hits under async mode hold the settled value, not a promise —
            // re-wrap so the declared async signature is honored.
            return asyncMode === 'async' ? (Promise.resolve(hit) as Return) : (hit as Return);
        };
    };
}

/**
 * Reads the spec recorded by `@cached` for a method.
 *
 * @param target - The decorated class constructor (or instance).
 * @param methodName - The decorated method name.
 * @returns The normalized spec, or `undefined` when not cached.
 */
export function getCachedSpec(target: object, methodName: string): NormalizedCachedSpec | undefined {
    const metadata = (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
    return metadata[`${CACHED_METADATA_PREFIX}${methodName}`] as NormalizedCachedSpec | undefined;
}
