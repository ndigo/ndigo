/**
 * A fixed-capacity ring buffer implementing `ArrayLike` and `Iterable`.
 */
import { Serializable, JSONArray, serialize } from './serializable.js';

/** `typeof`/`instanceof` check that also accepts boxed `String` objects. */
const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

/**
 * Determines whether a value is array-like: an array, string, element, or an
 * object exposing a coherent `length` and last index.
 */
const likeArray = (value: unknown): value is ArrayLike<unknown> => {
    if (value == null) return false;
    if (Array.isArray(value) || isString(value)) return true;
    if (typeof value !== 'object') return false;
    // Arbitrary structured input: DOM nodes and array-likes via generic property reflection
    const record = value as Record<string, unknown>;
    const length: unknown = record.length;
    if (record.nodeType === 1) return typeof length === 'number' && length > 0;
    if (length === 0) return true;
    if (typeof length === 'number' && length > 0) return '0' in value && String(length - 1) in value;
    return false;
};

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
 * A fixed-capacity ring buffer implementing `ArrayLike` and `Iterable`.
 *
 * @example
 * ```ts
 * const buffer = new RingBuffer<number>(4);
 * buffer.put(1, 2);
 * [...buffer]; // [1, 2]
 * ```
 */
export class RingBuffer<T = unknown> implements ArrayLike<T | undefined>, Iterable<T>, Serializable {
    /** Current capacity (power of two). */
    protected _capacity!: number;
    /** Head index. */
    protected _head!: number;
    /** Tail index. */
    protected _tail!: number;
    /** Full flag bit. */
    protected _full!: number;

    /**
     * The maximum capacity of any RingBuffer instance.
     */
    static readonly MAX_CAPACITY: number;
    /**
     * The minimum capacity of any RingBuffer instance.
     */
    static readonly MIN_CAPACITY: number;

    [n: number]: T | undefined;

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
        if (typeof newCapacity !== 'number' || Number.isNaN(newCapacity)) {
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
            // Convert ArrayLike to array for apply
            const elementsArray = Array.from(capacityOrElements);
            this.put.apply(this, elementsArray);
        }
    }

    /**
     * Returns an iterator for the elements in the ring buffer, oldest
     * first. Walks `tail → head` across the wrap so every live element is
     * visited — the previous index-walk missed elements whose ring slots
     * sat past the wrap.
     * @returns An iterator for the elements.
     */
    *[Symbol.iterator](): Iterator<T, undefined, undefined> {
        const capacity = this._capacity,
            length = this.length;
        let index = this._tail;
        for (let i = 0; i < length; i++) {
            yield this[index] as T;
            index = (index + 1) & (capacity - 1);
        }
    }

    /**
     * Retrieves and removes the oldest element from the ring buffer.
     * @returns The oldest element, or `undefined` if the buffer is empty.
     */
    get(): T | undefined {
        let item: T | undefined;

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
     * Returns a JSON array representation of the ring buffer's contents,
     * oldest first (walks tail → head like the iterator — the previous
     * numeric slot walk dropped elements past the wrap).
     * @returns A JSON array.
     */
    toJSON(): JSONArray {
        const list: unknown[] = [];
        for (const item of this) {
            list.push(serialize(item));
        }
        return list as JSONArray;
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
