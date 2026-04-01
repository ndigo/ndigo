/**
 * @author Jeff Rose
 */

import { EntriesIterator, IndexedIterator, KeysIterator, ValuesIterator } from './iterable';
import { Serializable, JSONArray, serialize } from './serializable';
import { Enumerable } from './enumerable';
import { Constructable } from './constructable';
import { likeArray } from '@blue/util/types';

const { defineProperty } = Reflect,
    { max, min } = Math,
    FULL = 1 << 0,
    move = <T = any>(src: T[], srcIndex: number, dst: T[], dstIndex: number, length: number): void => {
        let index = 0;
        for (; index < length; index++) {
            dst[index + dstIndex] = src[index + srcIndex];
            src[index + srcIndex] = void 0;
        }
    },
    pow2AtLeast = (n: number): number => {
        n = n >>> 0;
        n = n - 1;
        n = n | (n >> 1);
        n = n | (n >> 2);
        n = n | (n >> 4);
        n = n | (n >> 8);
        n = n | (n >> 16);
        return n + 1;
    };

/**
 * @implements external:ArrayLike
 * @implements external:Iterable
 * @implements module:core.Serializable
 */
export class RingBuffer<T = any> implements ArrayLike<T>, Iterable<T>, Serializable {
    protected _capacity: number;
    protected _head: number;
    protected _tail: number;
    protected _full: number;

    /**
     * The maximum capacity of any RingBuffer instance.
     */
    static readonly MAX_CAPACITY: number;
    /**
     * The minimum capacity of any RingBuffer instance.
     */
    static readonly MIN_CAPACITY: number;

    [n: number]: T;

    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'RingBuffer';
    }

    /**
     * The current capacity of the ring buffer.
     */
    get capacity(): number {
        return this._capacity;
    }

    /**
     * Sets the capacity of the ring buffer. The new capacity will be a power of 2
     * between `MIN_CAPACITY` and `MAX_CAPACITY`.
     * @param newCapacity - The desired new capacity.
     */
    set capacity(newCapacity: number) {
        if (typeof newCapacity !== 'number') {
            this._capacity = RingBuffer.MIN_CAPACITY;
        } else {
            this._capacity = pow2AtLeast(min(max(RingBuffer.MIN_CAPACITY, newCapacity), RingBuffer.MAX_CAPACITY));
        }
    }

    /**
     * Indicates if the ring buffer is empty.
     */
    get isEmpty(): boolean {
        return !this.isFull && this._head === this._tail;
    }

    /**
     * Indicates if the ring buffer is full.
     */
    get isFull(): boolean {
        return (this._full & FULL) !== 0;
    }

    /**
     * The number of elements currently in the ring buffer.
     */
    get length(): number {
        let length: number;
        const capacity = this._capacity;
        if (this.isFull) {
            length = capacity;
        } else {
            const head = this._head,
                tail = this._tail;
            length = head >= tail ? head - tail : capacity + head - tail;
        }
        return length;
    }

    /**
     * Creates a new RingBuffer instance.
     * @param elements - An array-like object to initialize the buffer with.
     */
    constructor(elements: ArrayLike<T>);
    /**
     * Creates a new RingBuffer instance with a specified capacity.
     * @param capacity - The initial capacity of the buffer.
     */
    constructor(capacity: number);
    /**
     * Creates a new RingBuffer instance.
     * @param capacityOrElements - The initial capacity or an array-like object of elements.
     */
    constructor(capacityOrElements: number | ArrayLike<T> = RingBuffer.MIN_CAPACITY) {
        defineProperty(this, '_capacity', {
            value: RingBuffer.MIN_CAPACITY,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, '_full', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, '_head', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, '_tail', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        if (typeof capacityOrElements === 'number') {
            this.capacity = capacityOrElements;
        } else if (likeArray(capacityOrElements)) {
            this.put.apply(this, capacityOrElements);
        }
    }

    /**
     * Returns an iterator for the elements in the ring buffer.
     * @returns An iterator for the elements.
     */
    [Symbol.iterator](): Iterator<T, any, undefined> {
        return new IndexedIterator<T>(this);
    }

    /**
     * Retrieves and removes the oldest element from the ring buffer.
     * @returns The oldest element, or `undefined` if the buffer is empty.
     */
    get(): T {
        let item: T;

        if (this.length) {
            const tail = this._tail;
            item = this[tail];
            this[tail] = void 0;
            this._tail = (tail + 1) & (this._capacity - 1);
            this._full = this._full & ~FULL;
        }

        return item;
    }

    /**
     * Adds one or more elements to the ring buffer. If the buffer is full,
     * the oldest elements will be overwritten.
     * @param items - The elements to add.
     * @returns The new length of the ring buffer.
     */
    put(...items: T[]): number {
        const itemsLength = items.length;

        if (itemsLength) {
            const last = this._capacity - 1;
            let index = 0,
                head = this._head;

            for (; index < itemsLength; index++) {
                this[head] = items[index];
                head = (head + 1) & last;
                if (!this.isFull && head === this._tail) {
                    this._full = this._full | FULL;
                }
            }

            this._head = head;
            if (this.isFull) {
                this._tail = head;
            }
        }

        return this.length;
    }

    /**
     * Returns a JSON array representation of the ring buffer's contents.
     * @returns A JSON array.
     */
    toJSON(): JSONArray {
        const { length } = this,
            list = new Array(length);
        let index = 0;
        while (index < length) {
            list[index] = serialize(this[index++]);
        }
        return list;
    }

    /**
     * Returns a string representation of the ring buffer's contents.
     * @returns A comma-separated string of the elements.
     */
    toString(): string {
        return this.toJSON().join(',');
    }
}

defineProperty(RingBuffer, 'MAX_CAPACITY', {
    value: (1 << 30) | 0,
    configurable: true,
    enumerable: false,
    writable: false,
});

defineProperty(RingBuffer, 'MIN_CAPACITY', {
    value: 16,
    configurable: true,
    enumerable: false,
    writable: false,
});

/**
 * A RingBuffer that can dynamically resize its capacity.
 * @extends RingBuffer
 */
export class ResizableRingBuffer<T> extends RingBuffer<T> {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'ResizableRingBuffer';
    }

    /**
     * Adds one or more elements to the ring buffer, resizing if necessary.
     * If the buffer is full, the oldest elements will be overwritten.
     * @param items - The elements to add.
     * @returns The new length of the ring buffer.
     */
    put(...items: T[]): number {
        const length = this.length,
            itemsLength = items.length,
            totalLength = itemsLength + length;

        if (totalLength > this._capacity) {
            this.resizeTo(totalLength);
        }

        return super.put.apply(this, items);
    }

    /**
     * Resizes the ring buffer to a new capacity. If the new capacity is smaller
     * than the current number of elements, older elements will be discarded.
     * @param newCapacity - The desired new capacity.
     */
    resizeTo(newCapacity: number): void {
        const oldCapacity = this._capacity,
            head = this._head,
            tail = this._tail;

        this.capacity = newCapacity;

        if (tail < head) {
            const newHead = this.length;
            move<T>(this as unknown as T[], tail, this as unknown as T[], 0, newHead);
            this._tail = 0;
            this._head = newHead;
        } else if (tail > head) {
            const newHead = oldCapacity - tail;
            move<T>(this as unknown as T[], tail, this as unknown as T[], 0, newHead);
            move<T>(this as unknown as T[], 0, this as unknown as T[], newHead, head);
            this._tail = 0;
            this._head = newHead;
        } else if (tail === head) {
            this._tail = 0;
            this._head = this.isFull ? oldCapacity : 0;
        }

        this._full = this._full & ~FULL;
    }
}

/**
 * A mixin that adds enumerable capabilities to a RingBuffer.
 * @param superclass - The RingBuffer class to extend.
 * @returns A new class that is an Enumerable RingBuffer.
 */
export const AsEnumerableRingBuffer = <T extends Constructable<RingBuffer>, K extends keyof T, V>(
    superclass: T
): Constructable<Enumerable<K, V> & RingBuffer> & T =>
    class extends superclass implements Enumerable<K, V> {
        /**
         * Returns an iterator for the key-value pairs in the ring buffer.
         * @returns An iterator for [key, value] pairs.
         */
        entries(): Iterator<[K, V]> {
            return new EntriesIterator<V>(this) as Iterator<[K, V]>;
        }

        /**
         * Executes a provided function once for each element in the ring buffer.
         * @param callback - Function to execute for each element.
         * @param context - Value to use as `this` when executing callback.
         */
        forEach(callback: (value: V, key: K, list: Enumerable<K, V>) => void, context?: any): void {
            const length = this.length;
            if (length) {
                for (let index = 0; index < length; index++) {
                    callback.call(context || this, this[index], index, this);
                }
            }
        }

        /**
         * Returns an iterator for the keys (indices) in the ring buffer.
         * @returns An iterator for keys.
         */
        keys(): Iterator<K> {
            return new KeysIterator(this) as Iterator<K>;
        }

        /**
         * Returns an iterator for the values in the ring buffer.
         * @returns An iterator for values.
         */
        values(): Iterator<V> {
            return new ValuesIterator(this);
        }
    };

/**
 * Extension of the {@link external:Map|Map} interface that stores multiple values under a single key.
 */
export class MultiValueMap<K, V> extends Map<K, V[]> {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'MultiValueMap';
    }

    /**
     * Adds a value to the collection associated with the given key.
     * If the key does not exist, a new array is created for the value.
     * @param key - The key to associate the value with.
     * @param value - The value to add.
     * @returns This MultiValueMap instance.
     */
    add(key: K, value: V): this {
        const values: V[] = this.has(key) ? this.get(key) : [];
        values.push(value);
        return super.set(key, values);
    }
}
