/**
 * A generic Least-Recently-Used (LRU) cache backed by a hash map plus a
 * doubly linked list, giving O(1) lookup, promotion, and eviction. (The
 * previous Map-insertion-order implementation degraded to O(n) per eviction
 * once deleted slots piled up at the front of the table.)
 */
interface LRUNode<K, V> {
    key: K;
    value: V;
    prev: LRUNode<K, V> | null;
    next: LRUNode<K, V> | null;
}

export class LRUCache<K, V> {
    readonly #capacity: number;
    readonly #map: Map<K, LRUNode<K, V>> = new Map();
    #head: LRUNode<K, V> | null = null;
    #tail: LRUNode<K, V> | null = null;

    /**
     * @param capacity - Maximum number of entries before eviction occurs. Default: 256.
     */
    constructor(capacity = 256) {
        this.#capacity = capacity;
    }

    /** Maximum number of entries before eviction occurs. */
    get capacity(): number {
        return this.#capacity;
    }

    /** Current number of entries in the cache. */
    get size(): number {
        return this.#map.size;
    }

    #unlink(node: LRUNode<K, V>): void {
        if (node.prev !== null) {
            node.prev.next = node.next;
        } else {
            this.#head = node.next;
        }
        if (node.next !== null) {
            node.next.prev = node.prev;
        } else {
            this.#tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }

    #addToFront(node: LRUNode<K, V>): void {
        node.prev = null;
        node.next = this.#head;
        if (this.#head !== null) {
            this.#head.prev = node;
        }
        this.#head = node;
        if (this.#tail === null) {
            this.#tail = node;
        }
    }

    /**
     * Returns the cached value for `key`, or `undefined` if not present.
     * Promotes the entry to most-recently-used on hit.
     */
    get(key: K): V | undefined {
        const node = this.#map.get(key);
        if (node === undefined) {
            return undefined;
        }
        if (node !== this.#head) {
            this.#unlink(node);
            this.#addToFront(node);
        }
        return node.value;
    }

    /**
     * Sets a value in the cache. Evicts the least-recently-used entry if at capacity.
     */
    set(key: K, value: V): this {
        const existing = this.#map.get(key);
        if (existing !== undefined) {
            existing.value = value;
            if (existing !== this.#head) {
                this.#unlink(existing);
                this.#addToFront(existing);
            }
            return this;
        }

        if (this.#capacity > 0 && this.#map.size >= this.#capacity) {
            const oldest = this.#tail;
            if (oldest !== null) {
                this.#map.delete(oldest.key);
                this.#unlink(oldest);
            }
        }

        if (this.#capacity <= 0) {
            return this;
        }

        const node: LRUNode<K, V> = { key, value, prev: null, next: null };
        this.#map.set(key, node);
        this.#addToFront(node);
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
        const node = this.#map.get(key);
        if (node === undefined) {
            return false;
        }
        this.#map.delete(key);
        this.#unlink(node);
        return true;
    }

    /**
     * Removes all entries from the cache.
     */
    clear(): void {
        this.#map.clear();
        this.#head = null;
        this.#tail = null;
    }
}
