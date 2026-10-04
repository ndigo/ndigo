/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Branded sentinel returned by {@link Cache#get} when no entry exists (or an
 * entry has expired). Distinguishes "no value cached" from a cached
 * `undefined` — compare with `=== CacheMiss.INSTANCE` or {@link isCacheMiss}.
 *
 * The constructor is private: the only instance is {@link CacheMiss.INSTANCE},
 * so identity comparison is reliable (prefer identity over `instanceof`,
 * which breaks if a bundle duplicates the class).
 */
export class CacheMiss {
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
     * Size-limit eviction policy when {@link CacheOptions.maxSize maxSize} is
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
     */
    get(key: string): Promise<V | CacheMiss>;
    /**
     * Stores a value, optionally overriding the backend default TTL.
     * Capacity and eviction policy are backend-specific configuration.
     *
     * @throws {TypeError} When the value is the {@link CacheMiss} sentinel or
     *   the TTL is not a positive finite number of milliseconds.
     */
    set(key: string, value: V, ttl?: number): Promise<void>;
    /**
     * Returns whether the key holds a live entry. Does not update recency
     * in MemoryCache; remote expiry follows the backend's clock.
     */
    has(key: string): Promise<boolean>;
    /**
     * Removes an entry. Returns whether the entry existed.
     */
    delete(key: string): Promise<boolean>;
    /** Removes all entries. */
    clear(): Promise<void>;
    /** Entry count under the backend's documented expiry/concurrency policy. */
    size(): Promise<number>;
}

/**
 * In-memory cache with TTL expiry and bounded-size eviction.
 *
 * - **Expiry** is lazy: expired entries are removed on `get`/`has` access,
 *   never by a background sweep (the `TtlContentSource` model — no timers,
 *   safe in browsers and workers).
 * - **Eviction** follows the O(1) Map-order technique of the framework's
 *   internal LRU (`@blue/core` `_lru-cache.ts`): `lru` promotes hits by
 *   delete+reinsert and evicts the map's first key; `fifo` leaves order
 *   untouched on access and updates, evicting the oldest insertion.
 * - `defaultTtl`/`maxSize`/`eviction` are fixed at construction — a shared
 *   instance has uniform behavior (configure per named cache via
 *   {@link MemoryCacheManager}).
 */
export class MemoryCache<V = unknown> implements Cache<V> {
    readonly #entries: Map<string, CacheEntry<V>> = new Map();
    readonly #defaultTtl: number | undefined;
    readonly #maxSize: number;
    readonly #eviction: 'lru' | 'fifo';

    /**
     * @param options - Store configuration (see {@link CacheOptions}).
     * @throws {TypeError} For a non-integer/negative `maxSize`, a
     *   non-positive `defaultTtl`, or an unknown `eviction` policy.
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
        this.#maxSize = maxSize;
        this.#defaultTtl = defaultTtl;
        this.#eviction = eviction;
    }

    /** Entry count; expiry is lazy. */
    async size(): Promise<number> {
        return this.#entries.size;
    }

    async get(key: string): Promise<V | CacheMiss> {
        const entry = this.#entries.get(key);
        if (entry === undefined) {
            return CacheMiss.INSTANCE;
        }
        if (this.#expired(entry)) {
            this.#entries.delete(key);
            return CacheMiss.INSTANCE;
        }
        if (this.#eviction === 'lru') {
            // Map-order promotion: re-inserting at the end marks MRU.
            this.#entries.delete(key);
            this.#entries.set(key, entry);
        }
        return entry.value;
    }

    async set(key: string, value: V, ttl?: number): Promise<void> {
        if (value === CacheMiss.INSTANCE) {
            throw new TypeError('MemoryCache: cannot cache the CacheMiss sentinel as a value');
        }
        if (ttl !== undefined && (!Number.isFinite(ttl) || ttl <= 0)) {
            throw new TypeError(`MemoryCache: ttl must be a positive number of milliseconds — got ${ttl}`);
        }
        const ttlMs = ttl ?? this.#defaultTtl;
        const expiresAt = ttlMs === undefined ? undefined : Date.now() + ttlMs;

        if (this.#maxSize > 0 && !this.#entries.has(key) && this.#entries.size >= this.#maxSize) {
            // Evict the eviction candidate: Map's first key (LRU order under
            // `lru` promotion; insertion order under `fifo`).
            const candidate = this.#entries.keys().next().value;
            if (candidate !== undefined) {
                this.#entries.delete(candidate);
            }
        }
        if (this.#eviction === 'lru' && this.#entries.has(key)) {
            this.#entries.delete(key); // re-insert promotes the update to MRU
        }
        this.#entries.set(key, { value, expiresAt });
    }

    async has(key: string): Promise<boolean> {
        const entry = this.#entries.get(key);
        if (entry === undefined) {
            return false;
        }
        if (this.#expired(entry)) {
            this.#entries.delete(key);
            return false;
        }
        return true;
    }

    async delete(key: string): Promise<boolean> {
        return this.#entries.delete(key);
    }

    async clear(): Promise<void> {
        this.#entries.clear();
    }

    #expired(entry: CacheEntry<V>): boolean {
        return entry.expiresAt !== undefined && entry.expiresAt <= Date.now();
    }
}
