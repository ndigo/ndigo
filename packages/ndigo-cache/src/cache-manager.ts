/**
 * Named-cache registry and its in-memory implementation.
 */
import { Cache, CacheOptions, MemoryCache } from './cache';
import { resolveCacheName } from './cache-name';
import { ContextToken } from '@ndigo/factory';

/**
 * Named-cache registry. Acquires local backend handles synchronously without
 * performing data I/O; the returned Cache operations are awaited. `@cached`
 * resolves its named cache through this contract (`this.cacheManager`).
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
     * Returns the cache identified by a typed store token (AD-34 D7) —
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
 * manager's lifetime — the auto-configuration `cacheManager` bean is a
 * singleton per application context.
 */
export class MemoryCacheManager implements CacheManager {
    readonly #caches: Map<string, Cache<unknown>> = new Map();
    readonly #defaults: CacheOptions;

    /**
     * Creates a manager with the given defaults.
     *
     * @param options - Manager options (see {@link CacheManagerOptions}).
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
