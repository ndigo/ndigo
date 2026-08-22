/** @author Jeff Rose */
/**
 * A generic Least-Recently-Used (LRU) cache backed by insertion-order Map semantics.
 *
 * On cache hit, the entry is deleted and re-inserted to move it to the "most recently used"
 * end of the Map. On overflow, the first Map entry (least recently used) is evicted.
 *
 * @template K - Key type
 * @template V - Value type
 */
export declare class LRUCache<K, V> {
    #private;
    /**
     * @param capacity - Maximum number of entries before eviction occurs. Default: 256.
     */
    constructor(capacity?: number);
    /** Maximum number of entries before eviction occurs. */
    get capacity(): number;
    /** Current number of entries in the cache. */
    get size(): number;
    /**
     * Returns the cached value for `key`, or `undefined` if not present.
     * Promotes the entry to most-recently-used on hit.
     */
    get(key: K): V | undefined;
    /**
     * Sets a value in the cache. Evicts the least-recently-used entry if at capacity.
     */
    set(key: K, value: V): this;
    /**
     * Returns `true` if the key exists in the cache. Does NOT update recency.
     */
    has(key: K): boolean;
    /**
     * Removes a specific entry from the cache.
     */
    delete(key: K): boolean;
    /**
     * Removes all entries from the cache.
     */
    clear(): void;
}
