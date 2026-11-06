/**
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

    connect(): Promise<void> {
        return this.#connection.connect();
    }
    get lastError(): Error | undefined {
        return this.#connection.lastError;
    }

    getCache<V = unknown>(name: string): RedisCache<V>;
    getCache<V = unknown>(token: ContextToken<Cache<V>>): RedisCache<V>;
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

    hasCache(name: string): boolean;
    hasCache(token: ContextToken<Cache<unknown>>): boolean;
    hasCache(nameOrToken: string | ContextToken<Cache<unknown>>): boolean {
        if (this.#closed) throw new IllegalStateError('RedisCacheManager is closed');
        const name = resolveCacheName(nameOrToken, 'RedisCacheManager');
        return this.#caches.has(name);
    }

    close(): Promise<void> {
        this.#closed = true;
        return this.#connection.close();
    }
}
