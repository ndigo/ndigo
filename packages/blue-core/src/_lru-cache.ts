/**
 * A generic Least-Recently-Used (LRU) cache backed by insertion-order Map semantics.
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export class LRUCache<K, V> {
    readonly #capacity: number;
    readonly #map: Map<K, V>;

    /**
     * @param capacity - Maximum number of entries before eviction occurs. Default: 256.
     */
    constructor(capacity = 256) {
        this.#capacity = capacity;
        this.#map = new Map();
    }

    /** Maximum number of entries before eviction occurs. */
    get capacity(): number {
        return this.#capacity;
    }

    /** Current number of entries in the cache. */
    get size(): number {
        return this.#map.size;
    }

    /**
     * Returns the cached value for `key`, or `undefined` if not present.
     * Promotes the entry to most-recently-used on hit.
     */
    get(key: K): V | undefined {
        if (!this.#map.has(key)) return undefined;
        const value = this.#map.get(key) as V;
        // Promote to MRU by re-inserting at end
        this.#map.delete(key);
        this.#map.set(key, value);
        return value;
    }

    /**
     * Sets a value in the cache. Evicts the least-recently-used entry if at capacity.
     */
    set(key: K, value: V): this {
        if (this.#map.has(key)) {
            // Remove first so re-insert moves it to MRU end
            this.#map.delete(key);
        } else if (this.#map.size >= this.#capacity) {
            // Evict LRU: first key in insertion order
            this.#map.delete(this.#map.keys().next().value as K);
        }
        this.#map.set(key, value);
        return this;
    }

    /**
     * Returns `true` if the key exists in the cache. Does NOT update recency.
     */
    has(key: K): boolean {
        return this.#map.has(key);
    }

    /**
     * Removes a specific entry from the cache.
     */
    delete(key: K): boolean {
        return this.#map.delete(key);
    }

    /**
     * Removes all entries from the cache.
     */
    clear(): void {
        this.#map.clear();
    }
}
