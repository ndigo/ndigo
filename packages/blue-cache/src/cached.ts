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
 *   caller and are never stored — the in-flight slot is freed and the next
 *   call retries.
 * - **Async methods** return a promise callers await; the cache is written on
 *   settle. Concurrent misses for the same key are coalesced behind one
 *   in-flight computation (single-flight, mirroring {@link memoize}): only the
 *   first caller invokes the target while it is pending. A cache write that
 *   throws is logged and swallowed so a caching failure never breaks or hides
 *   the primary result (S2).
 * - Self-invocation through `this.method()` **is** cached: the wrapper
 *   replaces the prototype method (stronger than Spring proxy semantics,
 *   where self-invocation bypasses the cache).
 *
 * @param spec - Cache selection/key/TTL (see {@link CachedSpec}).
 * @returns The class method decorator.
 */
export function cached(spec: CachedSpec = {}) {
    const normalized = resolveCachedSpec(spec);

    // Recorded under `cache:<methodName>` for introspection; captured once so
    // the degradation warning (S3) can name the method without re-reading it.
    let methodName: string | undefined;

    return function <This, Args extends unknown[], Return>(
        value: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ): (this: This, ...args: Args) => Return {
        if (context.kind !== 'method') {
            throw new TypeError(`@cached can only be applied to a method — received '${context.kind}'.`);
        }
        methodName = String(context.name);
        context.metadata[`${CACHED_METADATA_PREFIX}${methodName}`] = normalized;

        let asyncMode: 'sync' | 'async' | undefined;
        // In-flight promises for the async single-flight path (S1): keyed by
        // cache key, cleared on settle/reject so it cannot grow unbounded.
        const inflight = new Map<string, Promise<unknown>>();
        // One-time guard for the graceful-degradation warning (S3).
        let degradationWarned = false;

        return function (this: This, ...args: Args): Return {
            // Structural contract, mirroring `@transactional`: the decorated
            // instance optionally carries the manager (constructor-injected);
            // absent → graceful call-through.
            const cacheAware = this as unknown as { cacheManager?: CacheManager };
            const manager = cacheAware.cacheManager;
            if (!manager) {
                if (!degradationWarned && isInDevMode()) {
                    degradationWarned = true;
                    console.warn(
                        `[@blue/cache] @cached("${methodName}") ran without a CacheManager — caching is disabled for this method.`
                    );
                }
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
                // S1: coalesce concurrent async computations behind one in-flight
                // promise — check before invoking the target so a second caller
                // does not re-run it.
                const pending = inflight.get(key);
                if (pending !== undefined) {
                    return pending as Return;
                }
                const result = value.apply(this, args);
                if (isPromiseLike(result)) {
                    if (asyncMode === undefined) {
                        asyncMode = 'async';
                    }
                    const settled = Promise.resolve(result).then(
                        (resolved) => {
                            inflight.delete(key);
                            // S2: a store write must not break or hide the result.
                            try {
                                store.set(key, resolved, normalized.ttl);
                            } catch (error) {
                                console.warn(`[@blue/cache] failed to cache "${methodName}" (${key}):`, error);
                            }
                            return resolved;
                        },
                        (reason) => {
                            // Never cache rejections; free the slot and re-throw so
                            // the caller's await still rejects.
                            inflight.delete(key);
                            throw reason;
                        }
                    );
                    inflight.set(key, settled);
                    return settled as Return;
                }
                if (asyncMode === undefined) {
                    asyncMode = 'sync';
                }
                store.set(key, result, normalized.ttl);
                return result;
            }

            // Hits under async mode hold the settled value, not a promise —
            // re-wrap so the declared async signature is honored.
            return asyncMode === 'async' ? (Promise.resolve(hit) as Return) : (hit as Return);
        };
    };
}

/**
 * True when runtime warnings are desired: any environment except an explicit
 * production build. Guards against referencing `process` in environments where
 * it is absent (e.g. some browser/worker bundles).
 */
function isInDevMode(): boolean {
    return typeof process !== 'undefined' && !!process.env && process.env.NODE_ENV !== 'production';
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
