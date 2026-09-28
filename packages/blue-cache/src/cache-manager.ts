/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Cache, CacheOptions, MemoryCache } from './cache';
import { ContextToken } from '@blue/factory';

/**
 * Named-cache registry. The application-level seam: `@cached` resolves its
 * named cache through this contract (`this.cacheManager`), and a
 * distributed/Redis implementation can replace the in-memory manager without
 * touching call sites (the audit's planned extension point).
 */
export interface CacheManager {
    /**
     * Returns the named cache, auto-creating it with the manager defaults
     * when absent.
     *
     * @param name - Non-empty cache name.
     * @throws {TypeError} For a non-string or empty name.
     */
    getCache<V = unknown>(name: string): Cache<V>;
    /**
     * Returns the cache identified by a typed store token (AD-34 D7) —
     * description-backed, same store as the string form.
     *
     * @param token - The cache store token.
     */
    getCache<V = unknown>(token: ContextToken<Cache<V>>): Cache<V>;
    /**
     * Returns whether the named cache exists (no creation).
     */
    hasCache(name: string): boolean;
    /**
     * Returns whether the token-identified cache exists (no creation).
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
 * manager's lifetime — the auto-configuration `cacheManager` bean is a
 * singleton per application context.
 */
export class MemoryCacheManager implements CacheManager {
    readonly #caches: Map<string, Cache<unknown>> = new Map();
    readonly #defaults: CacheOptions;

    /**
     * @param options - Manager options (see {@link CacheManagerOptions}).
     */
    constructor(options: CacheManagerOptions = {}) {
        this.#defaults = options.defaults ?? {};
    }

    getCache<V = unknown>(name: string): Cache<V>;
    getCache<V = unknown>(token: ContextToken<Cache<V>>): Cache<V>;
    getCache<V = unknown>(nameOrToken: string | ContextToken<Cache<V>>): Cache<V> {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`MemoryCacheManager: cache name must be a non-empty string — got ${String(name)}`);
        }
        let cache = this.#caches.get(name);
        if (cache === undefined) {
            cache = new MemoryCache(this.#defaults);
            this.#caches.set(name, cache);
        }
        return cache as Cache<V>;
    }

    hasCache(name: string): boolean;
    hasCache(token: ContextToken<Cache<unknown>>): boolean;
    hasCache(nameOrToken: string | ContextToken<Cache<unknown>>): boolean {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
        return this.#caches.has(name);
    }
}
