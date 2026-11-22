/**
 * A bounded cache with configurable eviction policy (LRU or FIFO).
 *
 * `BoundedCache` caps the number of stored entries and evicts according to the
 * configured policy when the cap is exceeded. Use it for in-memory memoization
 * with a predictable memory footprint.
 *
 * @example
 * ```ts
 * const cache = new BoundedCache<string, number>(128, 'lru');
 * cache.set('a', 1);
 * cache.get('a'); // 1
 * ```
 */
import { createNull } from './null.js';
/**
 * Options for {@link BoundedCache}.
 */
export interface BoundedCacheOptions<K, V> {
    /** Maximum number of entries before eviction occurs. Default: 256. */
    maxSize?: number;
    /** Eviction policy. Default: `'lru'`. */
    policy?: 'lru' | 'fifo';
    /** Called with the value and key removed by overflow eviction or `clear()`. */
    onEvict?: (value: V, key: K) => void;
}

/**
 * A bounded cache with configurable eviction policy (`'lru'` or `'fifo'`).
 *
 * Backed by a hash map: LRU promotion uses delete-and-reinsert, FIFO keeps
 * insertion order. `onEvict` is reported on overflow eviction and `clear()`.
 */
export class BoundedCache<K, V> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "BoundedCache".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object BoundedCache]"
     */
    get [Symbol.toStringTag](): string {
        return 'BoundedCache';
    }

    readonly #capacity: number;
    readonly #policy: 'lru' | 'fifo';
    readonly #onEvict: ((value: V, key: K) => void) | undefined;
    readonly #entries = new Map<K, V>();

    /**
     * Creates a bounded cache.
     *
     * @param options - Cache configuration.
     */
    constructor(options: BoundedCacheOptions<K, V> = {}) {
        this.#capacity = options.maxSize ?? 256;
        this.#policy = options.policy ?? 'lru';
        this.#onEvict = options.onEvict;
    }

    /** Maximum number of entries before eviction occurs. */
    get capacity(): number {
        return this.#capacity;
    }

    /** Eviction policy. */
    get policy(): 'lru' | 'fifo' {
        return this.#policy;
    }

    /** Current number of entries. */
    get size(): number {
        return this.#entries.size;
    }

    /**
     * Looks up a cached value. For LRU policy, a hit promotes the entry to
     * most-recently-used.
     *
     * @param key - The cache key.
     * @returns The cached value, or `undefined`.
     */
    get(key: K): V | undefined {
        const value = this.#entries.get(key);
        if (value === undefined && !this.#entries.has(key)) {
            return undefined;
        }
        if (this.#policy === 'lru' && this.#entries.has(key)) {
            this.#entries.delete(key);
            this.#entries.set(key, value as V);
        }
        return value;
    }

    /**
     * Returns `true` if the key exists. Does NOT update recency.
     *
     * @param key - The cache key.
     */
    has(key: K): boolean {
        return this.#entries.has(key);
    }

    /**
     * Looks up a cached value WITHOUT updating recency (no promotion, even
     * under the `'lru'` policy). Use when the access must not affect eviction
     * order.
     *
     * @param key - The cache key.
     * @returns The cached value, or `undefined`.
     */
    peek(key: K): V | undefined {
        return this.#entries.get(key);
    }

    /**
     * Stores a value, evicting the oldest entry first when a new key would
     * exceed the bound. Re-setting an existing key updates its value (and
     * promotes it for LRU). Calls `onEvict` on overflow eviction.
     *
     * @param key - The cache key.
     * @param value - The value to cache.
     */
    set(key: K, value: V): void {
        if (this.#capacity <= 0) {
            return;
        }
        if (this.#entries.has(key)) {
            if (this.#policy === 'lru') {
                this.#entries.delete(key);
            } else {
                this.#entries.set(key, value);
                return;
            }
        } else if (this.#entries.size >= this.#capacity) {
            const oldest = this.#entries.keys().next().value;
            if (oldest !== undefined) {
                const evicted = this.#entries.get(oldest);
                this.#entries.delete(oldest);
                if (evicted !== undefined) {
                    this.#onEvict?.(evicted, oldest as K);
                }
            }
        }
        this.#entries.set(key, value);
    }

    /**
     * Removes a specific entry.
     *
     * @param key - The cache key.
     * @returns `true` if the entry existed.
     */
    delete(key: K): boolean {
        return this.#entries.delete(key);
    }

    /**
     * Removes every cached value, reporting each to `onEvict`.
     */
    clear(): void {
        for (const [key, value] of this.#entries) {
            this.#onEvict?.(value, key);
        }
        this.#entries.clear();
    }

    /**
     * A null-prototype plain object mirror of the cache entries, preserving
     * insertion order.
     *
     * @returns The entries as a keyed object.
     */
    toObject(): { [key: string]: V } {
        const result = createNull() as { [key: string]: V };
        for (const [key, value] of this.#entries) {
            result[String(key)] = value;
        }
        return result;
    }
}
