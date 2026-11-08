/**
 * Redis-backed named-cache manager.
 */
import { resolveCacheName } from '@ndigo/cache';
import { IllegalStateError } from '@ndigo/core';
import type { Cache, CacheManager } from '@ndigo/cache';
import type { AsyncCloseable, ContextToken } from '@ndigo/factory';
import { RedisConnection, type RedisConnectionOptions } from '../connection';
import { RedisCache } from './cache';

/** Explicit connection plus application/environment namespace and TTL defaults. */
export type RedisCacheManagerOptions = RedisConnectionOptions & {
    namespace: string;
    defaults?: { defaultTtl?: number };
};

/**
 * Local named-handle registry over shared Redis data. getCache/hasCache perform
 * no I/O; hasCache means this manager acquired a handle, not that Redis has data.
 * Container-compatible close() drains operations; a ready injected client is
 * borrowed and remains usable after manager shutdown.
 */
export class RedisCacheManager implements CacheManager, AsyncCloseable {
    readonly #connection: RedisConnection;
    readonly #namespace: string;
    readonly #defaults: { defaultTtl?: number };
    readonly #caches = new Map<string, RedisCache<unknown>>();
    #closed = false;

    /**
     * Creates a manager over a borrowed or owned Redis connection.
     *
     * @param options - Connection, namespace, and TTL defaults.
     */
    constructor(options: RedisCacheManagerOptions) {
        // Validate policy even when no handle is acquired.
        this.#namespace = options.namespace;
        this.#defaults = { ...options.defaults };
        if ('maxSize' in options || 'eviction' in options) {
            throw new TypeError('RedisCacheManager: maxSize and eviction are not supported');
        }
        if (typeof this.#namespace !== 'string' || this.#namespace.length === 0) {
            throw new TypeError('RedisCacheManager: namespace must be a non-empty string');
        }
        if ('maxSize' in this.#defaults || 'eviction' in this.#defaults) {
            throw new TypeError('RedisCacheManager: maxSize and eviction are not supported');
        }
        const ttl = this.#defaults.defaultTtl;
        if (ttl !== undefined && (!Number.isFinite(ttl) || ttl <= 0 || !Number.isSafeInteger(Math.ceil(ttl)))) {
            throw new TypeError('RedisCacheManager: TTL must be positive finite safe milliseconds');
        }
        this.#connection = new RedisConnection(options);
    }

    /**
     * Connects the underlying Redis connection.
     *
     * @returns A promise that resolves once connected.
     */
    connect(): Promise<void> {
        return this.#connection.connect();
    }
    /** The most recent connection error, when one occurred. */
    get lastError(): Error | undefined {
        return this.#connection.lastError;
    }

    /**
     * Returns the named cache, auto-creating its handle.
     *
     * @param name - Non-empty cache name.
     * @returns The Redis cache handle.
     */
    getCache<V = unknown>(name: string): RedisCache<V>;
    /**
     * Returns the token-identified cache, auto-creating its handle.
     *
     * @param token - The cache store token.
     * @returns The Redis cache handle.
     */
    getCache<V = unknown>(token: ContextToken<Cache<V>>): RedisCache<V>;
    /**
     * Returns the cache for a name or token.
     *
     * @param nameOrToken - Cache name or typed store token.
     * @returns The Redis cache handle.
     */
    getCache<V = unknown>(nameOrToken: string | ContextToken<Cache<V>>): RedisCache<V> {
        if (this.#closed) throw new IllegalStateError('RedisCacheManager is closed');
        const name = resolveCacheName(nameOrToken, 'RedisCacheManager');
        let cache = this.#caches.get(name);
        if (cache === undefined) {
            cache = new RedisCache(this.#connection, {
                ...this.#defaults,
                namespace: this.#namespace,
                cacheName: name,
            });
            this.#caches.set(name, cache);
        }
        return cache as RedisCache<V>;
    }

    /**
     * Returns whether this manager acquired a handle for the name.
     *
     * @param name - Non-empty cache name.
     * @returns Whether the handle exists.
     */
    hasCache(name: string): boolean;
    /**
     * Returns whether this manager acquired a handle for the token.
     *
     * @param token - The cache store token.
     * @returns Whether the handle exists.
     */
    hasCache(token: ContextToken<Cache<unknown>>): boolean;
    /**
     * Returns whether this manager acquired a handle for the name or token.
     *
     * @param nameOrToken - Cache name or typed store token.
     * @returns Whether the handle exists.
     */
    hasCache(nameOrToken: string | ContextToken<Cache<unknown>>): boolean {
        if (this.#closed) throw new IllegalStateError('RedisCacheManager is closed');
        const name = resolveCacheName(nameOrToken, 'RedisCacheManager');
        return this.#caches.has(name);
    }

    /**
     * Seals the manager and closes the underlying connection.
     *
     * @returns A promise that resolves once closed.
     */
    close(): Promise<void> {
        this.#closed = true;
        return this.#connection.close();
    }
}
