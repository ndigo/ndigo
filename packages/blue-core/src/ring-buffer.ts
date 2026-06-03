/**
 * @author Jeff Rose
 */

import { IndexedIterator } from './iterable';
import { Serializable, JSONArray, serialize } from './serializable';
import { likeArray } from '@blue/util/types';

const { defineProperty } = Reflect,
    { max, min } = Math,
    FULL = 1 << 0,
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
     * Returns the oldest element (tail position) without removing it.
     * @returns The oldest element, or `undefined` if the buffer is empty.
     */
    peek(): T | undefined {
        if (this.isEmpty) return undefined;
        return this[this._tail];
    }

    /**
     * Returns the newest element (most recently added, head-1 position) without removing it.
     * @returns The newest element, or `undefined` if the buffer is empty.
     */
    peekHead(): T | undefined {
        if (this.isEmpty) return undefined;
        return this[(this._head - 1 + this._capacity) & (this._capacity - 1)];
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