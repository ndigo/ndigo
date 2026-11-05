/**
 * @module ndigo-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { isDevMode } from '@ndigo/context';
import { Cache, CacheMiss } from './cache';
import { resolveCacheName } from './cache-name';
import type { CacheManager } from './cache-manager';
import { serializeCacheKey } from './keys';
import { ContextToken } from '@ndigo/factory';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-cache:cached');

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
     * Typed cache-store handle (AD-34 D7): a `ContextToken`-identified cache
     * under the instance's {@link CacheManager}. Takes precedence over
     * `cacheName`; the token's description is the store name.
     */
    cache?: ContextToken<Cache<unknown>>;
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
    const cacheName = resolveCacheName(spec.cache ?? spec.cacheName ?? DEFAULT_CACHE_NAME, '@cached');
    const { key, ttl } = spec;
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
 * the raw method when absent — caching is disabled, but the method remains
 * async. Decorated methods must declare a Promise return type.
 *
 * Semantics:
 * - **Hits** return the stored settled value; **misses** call the target and
 *   store the result.
 * - **Fulfilled results only**: method rejections/throws propagate to the
 *   caller and are never stored — the in-flight slot is freed and the next
 *   call retries.
 * - **Single-flight** spans backend read, computation and awaited write.
 *   Concurrent calls for the same store/key share one computation. Cache
 *   read failures reject; write failures are logged and the computed result
 *   is returned (the existing best-effort write policy).
 * - Self-invocation through `this.method()` **is** cached: the wrapper
 *   replaces the prototype method (stronger than proxy interception semantics,
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
        value: (this: This, ...args: Args) => Promise<Return>,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
    ): (this: This, ...args: Args) => Promise<Return> {
        if (context.kind !== 'method') {
            throw new TypeError(`@cached can only be applied to a method — received '${context.kind}'.`);
        }
        methodName = String(context.name);
        context.metadata[`${CACHED_METADATA_PREFIX}${methodName}`] = normalized;

        // Isolate flights by the actual store, not only the string key: two
        // instances with separate managers must never share results.
        const flights = new WeakMap<Cache<unknown>, Map<string, Promise<Return>>>();
        // One-time guard for the graceful-degradation warning (S3).
        let degradationWarned = false;

        return async function (this: This, ...args: Args): Promise<Return> {
            // Structural contract, mirroring `@transactional`: the decorated
            // instance optionally carries the manager (constructor-injected);
            // absent — including a detached call with no receiver — degrades
            // to a graceful call-through.
            const cacheAware = this as unknown as { cacheManager?: CacheManager } | undefined;
            const manager = cacheAware?.cacheManager;
            if (!manager) {
                if (!degradationWarned && isDevMode()) {
                    degradationWarned = true;
                    logger.warn(
                        `[@ndigo/cache] @cached("${methodName}") ran without a CacheManager — caching is disabled for this method.`
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

            let inflight = flights.get(store);
            if (inflight === undefined) {
                inflight = new Map();
                flights.set(store, inflight);
            }
            const pending = inflight.get(key);
            if (pending !== undefined) return pending;

            const work = (async () => {
                const hit = await store.get(key);
                if (hit !== CacheMiss.INSTANCE) return hit as Return;
                const result = await value.apply(this, args);
                try {
                    await store.set(key, result, normalized.ttl);
                } catch (error) {
                    logger.warn(`[@ndigo/cache] failed to cache "${methodName}" (${key}):`, {
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
                return result;
            })();
            inflight.set(key, work);
            try {
                return await work;
            } finally {
                inflight.delete(key);
            }
        };
    };
}

/** Narrows a metadata bag to its string-keyed record shape. */
function isMetadataRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}

/**
 * Reads the spec recorded by `@cached` for a method.
 *
 * Metadata lives on the class constructor, so an instance is resolved
 * through its `constructor` (mirrors `getSymbolMetadata`); both forms
 * return the same spec.
 *
 * @param target - The decorated class constructor or an instance of it.
 * @param methodName - The decorated method name.
 * @returns The normalized spec, or `undefined` when not cached.
 */
export function getCachedSpec(target: object, methodName: string): NormalizedCachedSpec | undefined {
    const carrier: object | undefined = typeof target === 'function' ? target : target?.constructor;
    if (carrier === undefined || !(Symbol.metadata in carrier)) {
        return undefined;
    }
    const metadata: unknown = carrier[Symbol.metadata];
    if (!isMetadataRecord(metadata)) {
        return undefined;
    }
    const spec = metadata[`${CACHED_METADATA_PREFIX}${methodName}`];
    return spec as NormalizedCachedSpec | undefined;
}
