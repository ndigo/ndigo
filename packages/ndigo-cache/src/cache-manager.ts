/**
 * Named-cache registry and its in-memory implementation.
 */
import { Cache, CacheOptions, MemoryCache } from './cache';
import { resolveCacheName } from './cache-name';
import { Constructable } from '@ndigo/core';
import { ContextToken, Aware, AsAware, likeAwareAnd } from '@ndigo/factory';
import { like } from '@ndigo/util/types';

/**
 * Named-cache registry. Acquires local backend handles synchronously without
 * performing data I/O; the returned Cache operations are awaited.
 * `CachedInterceptor` resolves a `@cached` method's named cache through this
 * contract (`this.cacheManager`).
 */
export interface CacheManager {
    /**
     * Returns the named cache, auto-creating it with the manager defaults
     * when absent.
     *
     * @param name - Non-empty cache name.
     * @throws For a non-string or empty name.
     */
    getCache<V = unknown>(name: string): Cache<V>;
    /**
     * Returns the cache identified by a typed store token —
     * description-backed, same store as the string form.
     *
     * @param token - The cache store token.
     */
    getCache<V = unknown>(token: ContextToken<Cache<V>>): Cache<V>;
    /**
     * Returns whether the named cache exists (no creation).
     *
     * @param name - Non-empty cache name.
     * @throws For a non-string or empty name.
     */
    hasCache(name: string): boolean;
    /**
     * Returns whether the token-identified cache exists (no creation).
     *
     * @param token - The cache store token.
     * @throws For an empty token description.
     */
    hasCache(token: ContextToken<Cache<unknown>>): boolean;
}

/**
 * Options for a {@link MemoryCacheManager}.
 */
export interface CacheManagerOptions {
    /**
     * Defaults applied to every auto-created cache (see {@link CacheOptions}).
     */
    defaults?: CacheOptions;
}

/**
 * In-memory {@link CacheManager}: auto-creates {@link MemoryCache} stores on
 * first `getCache(name)` with the manager defaults. Caches are owned for the
 * manager's lifetime — the auto-configuration `cacheManager` entry is a
 * singleton per application context.
 */
export class MemoryCacheManager implements CacheManager {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MemoryCacheManager".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MemoryCacheManager]"
     */
    get [Symbol.toStringTag](): string {
        return 'MemoryCacheManager';
    }

    readonly #caches: Map<string, Cache<unknown>> = new Map();
    readonly #defaults: CacheOptions;

    /**
     * Creates a manager with the given defaults.
     *
     * @param options - Manager options (see {@link CacheManagerOptions}).
     *
     * @example
     * ```ts
     * const manager = new MemoryCacheManager({ defaults: { defaultTtl: 30_000 } });
     * const cache = manager.getCache<string>('users');
     * await cache.set('u:1', 'alice');
     * ```
     */
    constructor(options: CacheManagerOptions = {}) {
        this.#defaults = options.defaults ?? {};
    }

    /**
     * Returns the named cache, auto-creating it when absent.
     *
     * @param name - Non-empty cache name.
     * @returns The cache store.
     */
    getCache<V = unknown>(name: string): Cache<V>;
    /**
     * Returns the token-identified cache, auto-creating it when absent.
     *
     * @param token - The cache store token.
     * @returns The cache store.
     */
    getCache<V = unknown>(token: ContextToken<Cache<V>>): Cache<V>;
    /**
     * Returns the cache for a name or token.
     *
     * @param nameOrToken - Cache name or typed store token.
     * @returns The cache store.
     */
    getCache<V = unknown>(nameOrToken: string | ContextToken<Cache<V>>): Cache<V> {
        const name = resolveCacheName(nameOrToken, 'MemoryCacheManager');
        let cache = this.#caches.get(name);
        if (cache === undefined) {
            cache = new MemoryCache(this.#defaults);
            this.#caches.set(name, cache);
        }
        return cache as Cache<V>;
    }

    /**
     * Returns whether the named cache exists (no creation).
     *
     * @param name - Non-empty cache name.
     * @returns Whether the cache exists.
     */
    hasCache(name: string): boolean;
    /**
     * Returns whether the token-identified cache exists (no creation).
     *
     * @param token - The cache store token.
     * @returns Whether the cache exists.
     */
    hasCache(token: ContextToken<Cache<unknown>>): boolean;
    /**
     * Returns whether the cache for a name or token exists.
     *
     * @param nameOrToken - Cache name or typed store token.
     * @returns Whether the cache exists.
     */
    hasCache(nameOrToken: string | ContextToken<Cache<unknown>>): boolean {
        const name = resolveCacheName(nameOrToken, 'MemoryCacheManager');
        return this.#caches.has(name);
    }
}

/**
 * Marks an object that can receive a {@link CacheManager}.
 */
export interface CacheManagerAware extends Aware {
    /**
     * Sets the cache manager used by the receiver.
     *
     * @param cacheManager - The cache manager to attach.
     */
    setCacheManager(cacheManager: CacheManager): void;
}

/**
 * Mixes cache-manager awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a cache manager.
 */
export const AsCacheManagerAware = <T extends Constructable>(superclass: T): Constructable<CacheManagerAware> & T =>
    class extends AsAware(superclass) implements CacheManagerAware {
        cacheManager: CacheManager | null = null;
        setCacheManager(cacheManager: CacheManager): void {
            Reflect.defineProperty(this, 'cacheManager', {
                value: cacheManager,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like cache-manager-aware state.
 *
 * @param value - The candidate value.
 * @returns Whether the value can receive a cache manager.
 */
export const likeCacheManagerAware = likeAwareAnd(like({ setCacheManager: Function })) as (
    value: unknown
) => value is CacheManagerAware;
