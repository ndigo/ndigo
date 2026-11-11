/**
 * A binary heap (min-heap by default) with O(log n) push/pop and O(1) peek.
 *
 * Pass a comparator to build a max-heap or a priority queue over arbitrary
 * values; combine comparators with `chainComparisons`/`compareBy` for
 * multi-key ordering.
 */
import { type comparison, naturalComparison } from './comparable.js';
import { Equatable } from './equatable.js';
import { Serializable, JSONArray, serialize } from './serializable.js';

export class Heap<T> implements Serializable, Equatable<Heap<T>> {
    #items: T[] = [];
    #compare: comparison<T>;

    get [Symbol.toStringTag](): string {
        return 'Heap';
    }

    /**
     * Number of stored values.
     */
    get size(): number {
        return this.#items.length;
    }

    constructor(compare: comparison<T> = naturalComparison as comparison<T>) {
        this.#compare = compare;
    }

    #siftUp(index: number): void {
        let i = index;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.#compare(this.#items[i], this.#items[parent]) < 0) {
                const tmp = this.#items[i];
                this.#items[i] = this.#items[parent];
                this.#items[parent] = tmp;
                i = parent;
            } else {
                break;
            }
        }
    }

    #siftDown(index: number): void {
        const n = this.#items.length;
        let i = index;
        while (true) {
            const left = i * 2 + 1;
            const right = left + 1;
            let smallest = i;
            if (left < n && this.#compare(this.#items[left], this.#items[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.#compare(this.#items[right], this.#items[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== i) {
                const tmp = this.#items[i];
                this.#items[i] = this.#items[smallest];
                this.#items[smallest] = tmp;
                i = smallest;
            } else {
                break;
            }
        }
    }

    /**
     * Inserts a value.
     *
     * @param value - The value to insert.
     * @returns This heap, for chaining.
     */
    push(value: T): this {
        this.#items.push(value);
        this.#siftUp(this.#items.length - 1);
        return this;
    }

    /**
     * Removes and returns the root (smallest by the comparator).
     *
     * @returns The root value, or `undefined` when the heap is empty.
     */
    pop(): T | undefined {
        const n = this.#items.length;
        if (n === 0) return undefined;
        const root = this.#items[0];
        const last = this.#items.pop() as T;
        if (this.#items.length > 0) {
            this.#items[0] = last;
            this.#siftDown(0);
        }
        return root;
    }

    /**
     * Returns the root without removing it.
     *
     * @returns The root value, or `undefined` when the heap is empty.
     */
    peek(): T | undefined {
        return this.#items.length === 0 ? undefined : this.#items[0];
    }

    /**
     * Removes every value.
     */
    clear(): void {
        this.#items = [];
    }

    /**
     * Copies the values in internal heap order.
     *
     * @returns A new array of the stored values.
     */
    toArray(): T[] {
        return [...this.#items];
    }

    /**
     * Copies and sorts the values by the heap's comparator.
     *
     * @returns A new array in comparator order.
     */
    toSorted(): T[] {
        const copy = [...this.#items];
        copy.sort(this.#compare);
        return copy;
    }

    /**
     * Yields values in internal heap order.
     */
    *[Symbol.iterator](): Iterator<T> {
        for (const item of this.#items) yield item;
    }

    /**
     * Returns the JSON form in internal heap order.
     *
     * @returns A JSON array of the stored values.
     */
    toJSON(): JSONArray {
        return this.toArray().map((v) => serialize(v)) as JSONArray;
    }

    /**
     * Renders the values as a comma-separated string.
     *
     * @returns The serialized values.
     */
    toString(): string {
        return this.toJSON().join(',');
    }

    /**
     * Compares the sorted contents, independent of internal layout.
     *
     * @param value - The candidate to compare against.
     * @returns `true` when both heaps hold equal values in comparator order.
     */
    equals(value: unknown): boolean {
        if (!(value instanceof Heap)) return false;
        if (value.size !== this.#items.length) return false;
        const a = this.toSorted();
        const b = value.toSorted();
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}

/**
 * A priority queue backed by a {@link Heap}: FIFO ordering is not
 * guaranteed for equal priorities (use a chained comparator to break ties).
 */
export class PriorityQueue<T> {
    #heap: Heap<T>;

    /**
     * Number of queued values.
     */
    get size(): number {
        return this.#heap.size;
    }

    constructor(compare: comparison<T>) {
        this.#heap = new Heap<T>(compare);
    }

    /**
     * Adds a value to the queue.
     *
     * @param value - The value to enqueue.
     * @returns This queue, for chaining.
     */
    enqueue(value: T): this {
        this.#heap.push(value);
        return this;
    }

    /**
     * Removes and returns the highest-priority value.
     *
     * @returns The value that compares lowest, or `undefined` when empty.
     */
    dequeue(): T | undefined {
        return this.#heap.pop();
    }

    /**
     * Returns the highest-priority value without removing it.
     *
     * @returns The value that compares lowest, or `undefined` when empty.
     */
    peek(): T | undefined {
        return this.#heap.peek();
    }

    /**
     * Removes every queued value.
     */
    clear(): void {
        this.#heap.clear();
    }

    /**
     * Copies the values in internal heap order.
     *
     * @returns A new array of the queued values.
     */
    toArray(): T[] {
        return this.#heap.toArray();
    }

    /**
     * Copies and sorts the values by priority.
     *
     * @returns A new array in comparator order.
     */
    toSorted(): T[] {
        return this.#heap.toSorted();
    }

    /**
     * Yields values in internal heap order.
     */
    [Symbol.iterator](): Iterator<T> {
        return this.#heap[Symbol.iterator]();
    }

    /**
     * Returns the JSON form in internal heap order.
     *
     * @returns A JSON array of the queued values.
     */
    toJSON(): JSONArray {
        return this.#heap.toJSON();
    }

    /**
     * Renders the values as a comma-separated string.
     *
     * @returns The serialized values.
     */
    toString(): string {
        return this.#heap.toString();
    }
}
