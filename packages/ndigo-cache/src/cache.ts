/**
 * The cache contract, its miss sentinel, and the in-memory store.
 */

import { BoundedCache } from '@ndigo/core';

/**
 * Branded sentinel returned by {@link Cache#get} when no entry exists (or an
 * entry has expired). Distinguishes "no value cached" from a cached
 * `undefined` — compare with `=== CacheMiss.INSTANCE` or {@link isCacheMiss}.
 *
 * The constructor is private: the only instance is {@link CacheMiss.INSTANCE},
 * so identity comparison is reliable (prefer identity over `instanceof`,
 * which breaks if a bundle duplicates the class).
 *
 * @example
 * ```ts
 * const cache = new MemoryCache<string>();
 * const value = await cache.get('missing');
 * if (value === CacheMiss.INSTANCE) {
 *     console.log('no entry cached');
 * }
 * ```
 */
export class CacheMiss {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "CacheMiss".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object CacheMiss]"
     */
    get [Symbol.toStringTag](): string {
        return 'CacheMiss';
    }

    /** The sole miss sentinel instance. */
    static readonly INSTANCE: CacheMiss = new CacheMiss();

    private constructor() {
        // singleton — see class doc
    }
}

/**
 * Narrows a cached value to the miss sentinel.
 *
 * @param value - The value returned by {@link Cache#get}.
 * @returns Whether the value is the {@link CacheMiss} sentinel.
 *
 * @example
 * ```ts
 * const cache = new MemoryCache<string>();
 * const value = await cache.get('missing');
 * if (isCacheMiss(value)) {
 *     console.log('no entry cached');
 * }
 * ```
 */
export const isCacheMiss = (value: unknown): value is CacheMiss => value === CacheMiss.INSTANCE;

/**
 * Configuration for a {@link MemoryCache} store.
 */
export interface CacheOptions {
    /**
     * Default lifetime in milliseconds for entries set without an explicit
     * TTL. Omitted (or `0`) = entries live until evicted or cleared.
     */
    defaultTtl?: number;
    /**
     * Maximum number of entries before eviction. Omitted (or `0`) = no size
     * eviction — entries are bounded only by {@link CacheOptions.defaultTtl}
     * and explicit deletes. Default: no size bound.
     */
    maxSize?: number;
    /**
     * Size-limit eviction policy when {@link CacheOptions#maxSize | maxSize} is
     * set: `lru` (default) evicts the least-recently-used entry (get and set
     * hits promote it), `fifo` evicts the oldest-inserted entry regardless of
     * access or update.
     */
    eviction?: 'lru' | 'fifo';
}

interface CacheEntry<V> {
    value: V;
    expiresAt: number | undefined;
}

/**
 * The generic awaitable cache contract. Backend failures reject rather than
 * becoming misses. Cache handles are acquired synchronously through the
 * manager; data operations are awaited for both memory and remote stores.
 */
export interface Cache<V = unknown> {
    /**
     * Returns the live cached value or the {@link CacheMiss} sentinel.
     * Expiry and recency handling follow the backend's documented policy;
     * MemoryCache removes expired entries lazily and promotes LRU hits.
     *
     * @param key - The cache key.
     * @returns The cached value, or the miss sentinel.
     */
    get(key: string): Promise<V | CacheMiss>;
    /**
     * Stores a value, optionally overriding the backend default TTL.
     * Capacity and eviction policy are backend-specific configuration.
     *
     * @param key - The cache key.
     * @param value - The value to store.
     * @param ttl - Optional entry lifetime in milliseconds.
     * @returns A promise that resolves once the value is stored.
     * @throws When the value is the {@link CacheMiss} sentinel or
     *   the TTL is not a positive finite number of milliseconds.
     */
    set(key: string, value: V, ttl?: number): Promise<void>;
    /**
     * Returns whether the key holds a live entry. Does not update recency
     * in MemoryCache; remote expiry follows the backend's clock.
     *
     * @param key - The cache key.
     * @returns Whether a live entry exists.
     */
    has(key: string): Promise<boolean>;
    /**
     * Removes an entry. Returns whether the entry existed.
     *
     * @param key - The cache key.
     * @returns Whether the entry existed.
     */
    delete(key: string): Promise<boolean>;
    /** Removes all entries. @returns A promise that resolves once cleared. */
    clear(): Promise<void>;
    /** Entry count under the backend's documented expiry/concurrency policy. @returns The entry count. */
    size(): Promise<number>;
}

/**
 * In-memory cache with TTL expiry and bounded-size eviction.
 *
 * - **Expiry** is lazy: expired entries are removed on `get`/`has` access,
 *   never by a background sweep (the `TtlContentSource` model — no timers,
 *   safe in browsers and workers).
 * - **Eviction** delegates to `@ndigo/core` `BoundedCache`: `lru` promotes
 *   hits by delete+reinsert and evicts the map's first key; `fifo` leaves
 *   order untouched on access and updates, evicting the oldest insertion.
 * - `defaultTtl`/`maxSize`/`eviction` are fixed at construction — a shared
 *   instance has uniform behavior (configure per named cache via
 *   {@link "cache-manager".MemoryCacheManager | MemoryCacheManager}).
 *
 * @example
 * ```ts
 * const cache = new MemoryCache<number>({ maxSize: 128 });
 * cache.set('a', 1);
 * cache.get('a'); // 1
 * ```
 */
export class MemoryCache<V = unknown> implements Cache<V> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MemoryCache".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MemoryCache]"
     */
    get [Symbol.toStringTag](): string {
        return 'MemoryCache';
    }

    readonly #cache: BoundedCache<string, CacheEntry<V>>;
    readonly #defaultTtl: number | undefined;

    /**
     * Creates a cache with the given options.
     *
     * @param options - Store configuration (see {@link CacheOptions}).
     * @throws For a non-integer/negative `maxSize`, a
     *   non-positive `defaultTtl`, or an unknown `eviction` policy.
     *
     * @example
     * ```ts
     * const cache = new MemoryCache<string>({ defaultTtl: 60_000, maxSize: 100 });
     * await cache.set('greeting', 'hello');
     * const value = await cache.get('greeting');
     * console.log(value); // "hello"
     * ```
     */
    constructor(options: CacheOptions = {}) {
        const maxSize = options.maxSize ?? 0;
        const defaultTtl = options.defaultTtl;
        const eviction = options.eviction ?? 'lru';
        if (!Number.isInteger(maxSize) || maxSize < 0) {
            throw new TypeError(`MemoryCache: maxSize must be a non-negative integer — got ${maxSize}`);
        }
        if (defaultTtl !== undefined && (!Number.isFinite(defaultTtl) || defaultTtl <= 0)) {
            throw new TypeError(
                `MemoryCache: defaultTtl must be a positive number of milliseconds — got ${defaultTtl}`
            );
        }
        if (eviction !== 'lru' && eviction !== 'fifo') {
            throw new TypeError(`MemoryCache: eviction must be 'lru' or 'fifo' — got ${String(eviction)}`);
        }
        this.#defaultTtl = defaultTtl;
        // maxSize 0 means "unbounded" in MemoryCache; BoundedCache treats 0 as
        // "store nothing", so map it to Infinity to keep the no-eviction
        // contract.
        this.#cache = new BoundedCache<string, CacheEntry<V>>({
            maxSize: maxSize === 0 ? Infinity : maxSize,
            policy: eviction,
        });
    }

    /**
     * Entry count; expiry is lazy.
     *
     * @returns The number of stored entries.
     */
    async size(): Promise<number> {
        return this.#cache.size;
    }

    /**
     * Returns the live value or the miss sentinel, promoting LRU hits.
     *
     * @param key - The cache key.
     * @returns The cached value, or the miss sentinel.
     */
    async get(key: string): Promise<V | CacheMiss> {
        const entry = this.#cache.get(key);
        if (entry === undefined) {
            return CacheMiss.INSTANCE;
        }
        if (this.#expired(entry)) {
            this.#cache.delete(key);
            return CacheMiss.INSTANCE;
        }
        return entry.value;
    }

    /**
     * Stores a value with an optional TTL override.
     *
     * @param key - The cache key.
     * @param value - The value to store.
     * @param ttl - Optional entry lifetime in milliseconds.
     * @returns A promise that resolves once the value is stored.
     */
    async set(key: string, value: V, ttl?: number): Promise<void> {
        if (value === CacheMiss.INSTANCE) {
            throw new TypeError('MemoryCache: cannot cache the CacheMiss sentinel as a value');
        }
        if (ttl !== undefined && (!Number.isFinite(ttl) || ttl <= 0)) {
            throw new TypeError(`MemoryCache: ttl must be a positive number of milliseconds — got ${ttl}`);
        }
        const ttlMs = ttl ?? this.#defaultTtl;
        const expiresAt = ttlMs === undefined ? undefined : Date.now() + ttlMs;

        this.#cache.set(key, { value, expiresAt });
    }

    /**
     * Whether the key holds a live entry.
     *
     * @param key - The cache key.
     * @returns Whether a live entry exists.
     */
    async has(key: string): Promise<boolean> {
        const entry = this.#cache.peek(key);
        if (entry === undefined) {
            return false;
        }
        if (this.#expired(entry)) {
            this.#cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Removes an entry.
     *
     * @param key - The cache key.
     * @returns Whether the entry existed.
     */
    async delete(key: string): Promise<boolean> {
        return this.#cache.delete(key);
    }

    /**
     * Removes all entries.
     *
     * @returns A promise that resolves once cleared.
     */
    async clear(): Promise<void> {
        this.#cache.clear();
    }

    #expired(entry: CacheEntry<V>): boolean {
        return entry.expiresAt !== undefined && entry.expiresAt <= Date.now();
    }
}
