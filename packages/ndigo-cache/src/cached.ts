/**
 * The `@cached` decorator: spec resolution and method memoization.
 */
import { getErrorMessage } from '@ndigo/util';
import '@tsmetadata/polyfill';
import { annotationOf, methodAnnotation, type MethodAnnotationKey } from '@ndigo/core';
import { AdviceOrder, type MethodInterceptor, type MethodInvocation } from '@ndigo/advice';
import { isDevMode, type ApplicationContext } from '@ndigo/context';
import { CACHE_MANAGER } from './context-tokens';
import { Cache, CacheMiss } from './cache';
import { resolveCacheName } from './cache-name';
import type { CacheManager } from './cache-manager';
import { serializeCacheKey } from './keys';
import { ContextToken } from '@ndigo/factory';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-cache:cached');

/**
 * `@cached` annotation key: the normalized spec recorded for a method. Pass
 * it to `hasAnnotation(...)` to select cached methods.
 *
 * @example
 * ```ts
 * rules.add({ when: hasAnnotation(cachedSpec), use: new CachedInterceptor() });
 * ```
 */
export const cachedSpec: MethodAnnotationKey<NormalizedCachedSpec> =
    methodAnnotation<NormalizedCachedSpec>('cache:cached');

/**
 * The named cache used when a spec omits `cacheName`.
 */
export const DEFAULT_CACHE_NAME = 'default';

/**
 * User-supplied `@cached` specification.
 *
 * @example
 * ```ts
 * const spec: CachedSpec = { cacheName: 'users', ttl: 60_000 };
 * ```
 */
export interface CachedSpec {
    /**
     * Typed cache-store handle: a `ContextToken`-identified cache
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
     * insertion order significant). No expression language.
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
 *
 * @example
 * ```ts
 * const spec: NormalizedCachedSpec = { cacheName: 'users', ttl: 60_000 };
 * ```
 */
export interface NormalizedCachedSpec {
    /** The resolved cache name. */
    cacheName: string;
    /** The resolved key strategy, when one was supplied. */
    key: string | ((...args: unknown[]) => string) | undefined;
    /** The entry lifetime in milliseconds, when set. */
    ttl: number | undefined;
}

/**
 * Normalizes and validates a {@link CachedSpec}. Throws at decoration time
 * for malformed specs — in any environment importing the module (the browser
 * included), mirroring `resolveScheduledSpec`.
 *
 * @param spec - The supplied spec.
 * @returns The normalized spec record.
 *
 * @example
 * ```ts
 * resolveCachedSpec({ cacheName: 'catalog', ttl: 30_000 });
 * // { cacheName: 'catalog', key: undefined, ttl: 30000 }
 * ```
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
 * Declares that a method is cached.
 *
 * The decorator records the normalized spec and returns the method unchanged —
 * {@link CachedInterceptor} serves the cache. A decorated method is inert on
 * its own: `new Service().load(id)` always computes until the instance is
 * advised, which keeps a unit test from needing a container.
 *
 * Semantics, once advised:
 * - **Hits** return the stored settled value; **misses** call the target and
 *   store the result.
 * - **Fulfilled results only**: method rejections/throws propagate to the
 *   caller and are never stored — the in-flight slot is freed and the next
 *   call retries.
 * - **Single-flight** spans backend read, computation and awaited write.
 *   Concurrent calls for the same store/key share one computation. Cache
 *   read failures reject; write failures are logged and the computed result
 *   is returned (the existing best-effort write policy).
 * - Self-invocation through `this.method()` **is** cached, because the advice
 *   is installed on the instance rather than around it. Frozen, sealed, and
 *   function-shaped targets are advised through the proxy fallback, which does
 *   not cover self-invocation.
 *
 * @param spec - Cache selection/key/TTL (see {@link CachedSpec}).
 * @returns The class method decorator.
 *
 * @example
 * ```ts
 * class CatalogService {
 *     @cached({ cacheName: 'catalog', ttl: 30_000 })
 *     async load(id: string): Promise<unknown> {
 *         return id;
 *     }
 * }
 * ```
 */
/**
 * Declares that a method is cached.
 *
 * Records the normalized spec and returns the method unchanged —
 * {@link CachedInterceptor} serves the cache, so a decorated method on an
 * unadvised instance always computes. See {@link CachedInterceptor} for the
 * semantics once advised.
 *
 * @param spec - Cache selection, key strategy, and TTL (see {@link CachedSpec}).
 * @returns The method decorator.
 *
 * @example
 * ```ts
 * class CatalogService {
 *     @cached({ cacheName: 'catalog', ttl: 30_000 })
 *     async load(id: string): Promise<unknown> {
 *         return id;
 *     }
 * }
 * ```
 */
export function cached(spec: CachedSpec = {}) {
    const normalized = resolveCachedSpec(spec);

    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        if (context.kind !== 'method') {
            throw new TypeError(`@cached can only be applied to a method — received '${context.kind}'.`);
        }
        return cachedSpec(normalized)(target, context);
    };
}

/**
 * Single-flight and memoization for `@cached` methods.
 *
 * Flights are isolated by the actual store, not only the string key: two
 * instances with separate managers never share an in-flight result.
 *
 * The interceptor is async because caching is: a cache read must settle
 * before the method can be skipped. A `@cached` method therefore returns a
 * promise even when its declared type is not one — the annotation is
 * invisible to the type system, so declare these methods `Promise`-returning.
 *
 * @example
 * ```ts
 * const service = interceptMethods(new CatalogService(), [
 *     { when: hasAnnotation(cachedSpec), use: new CachedInterceptor() },
 * ]);
 * ```
 */
export class CachedInterceptor implements MethodInterceptor {
    /**
     * The application band: a cache sits inside resilience, so a retry
     * re-runs the real computation and the result is stored once.
     */
    readonly order = AdviceOrder.Application;

    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "CachedInterceptor".
     */
    get [Symbol.toStringTag](): string {
        return 'CachedInterceptor';
    }

    /** In-flight computations, per store then per key. */
    readonly #flights = new WeakMap<Cache<unknown>, Map<string, Promise<unknown>>>();

    /** Methods already reported for running without a `CacheManager`. */
    readonly #warned = new Set<string>();

    /**
     * Serves a cached value when one is stored, otherwise runs the method and
     * stores its result.
     *
     * Fulfilled results only: a rejection propagates and frees the in-flight
     * slot, so the next call retries. A write failure is logged and the
     * computed result is still returned.
     *
     * @param invocation - The advised call.
     * @param next - Continues the inner chain and runs the method.
     * @returns The stored or computed result.
     */
    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const spec = invocation.annotation(cachedSpec);
        if (spec === undefined) {
            // A rule's matcher gates the chain; keep hand-built chains safe.
            return next();
        }

        const methodName = String(invocation.methodName);
        const manager = resolveCacheManager(invocation.target);
        if (manager === undefined) {
            // Structural contract: the instance optionally carries the
            // manager (constructor-injected); absent — including a detached
            // call with no receiver — degrades to a call-through.
            if (!this.#warned.has(methodName) && isDevMode()) {
                this.#warned.add(methodName);
                logger.warn(
                    `[@ndigo/cache] @cached("${methodName}") ran without a CacheManager — caching is disabled for this method.`
                );
            }
            return next();
        }

        const store = manager.getCache<unknown>(spec.cacheName);
        const key =
            typeof spec.key === 'string'
                ? spec.key
                : spec.key
                  ? spec.key(...invocation.args)
                  : serializeCacheKey(...invocation.args);

        let inflight = this.#flights.get(store);
        if (inflight === undefined) {
            inflight = new Map();
            this.#flights.set(store, inflight);
        }
        const pending = inflight.get(key);
        if (pending !== undefined) {
            return pending;
        }

        const work = (async () => {
            const hit = await store.get(key);
            if (hit !== CacheMiss.INSTANCE) {
                return hit;
            }
            const result = await next();
            try {
                await store.set(key, result, spec.ttl);
            } catch (error) {
                logger.warn(`[@ndigo/cache] failed to cache "${methodName}" (${key}):`, {
                    error: getErrorMessage(error),
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
    }
}

/**
 * Resolves the cache manager a cached instance was given: the instance's own
 * field first, then the application context it carries.
 *
 * @param target - The advised instance.
 * @returns The manager, or `undefined` when the instance has none.
 */
function resolveCacheManager(target: object): CacheManager | undefined {
    const cacheAware = target as { cacheManager?: CacheManager; applicationContext?: ApplicationContext };

    if (cacheAware.cacheManager !== undefined) {
        return cacheAware.cacheManager;
    }

    const context = cacheAware.applicationContext;
    if (context === undefined) {
        return undefined;
    }

    try {
        if (typeof context.hasValue === 'function' && context.hasValue(CACHE_MANAGER)) {
            return context.getValue(CACHE_MANAGER);
        }
        if (
            typeof context.hasValue === 'function' &&
            // oxlint-disable-next-line @ndigo/no-string-token-lookup -- fallback for token-less registrations
            context.hasValue('cacheManager')
        ) {
            // oxlint-disable-next-line @ndigo/no-string-token-lookup -- fallback for token-less registrations
            return context.getValue('cacheManager') as CacheManager;
        }
    } catch {
        return undefined;
    }

    return undefined;
}

/**
 * Reads the spec declared by `@cached` for a method.
 *
 * Walks the class hierarchy, so an inherited declaration resolves.
 *
 * @param target - The decorated class constructor or an instance of it.
 * @param methodName - The decorated method name.
 * @returns The normalized spec, or `undefined` when not cached.
 *
 * @example
 * ```ts
 * class CatalogService {
 *     @cached({ cacheName: 'catalog' })
 *     async load(id: string): Promise<unknown> { return id; }
 * }
 * getCachedSpec(CatalogService, 'load'); // { cacheName: 'catalog', key: undefined, ttl: undefined }
 * ```
 */
export function getCachedSpec(target: object, methodName: string): NormalizedCachedSpec | undefined {
    return annotationOf(target, cachedSpec, methodName);
}
