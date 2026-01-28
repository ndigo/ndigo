/**
 * @author Jeff Rose
 */

import { EntriesIterator, IndexedIterator, KeysIterator, ValuesIterator } from './iterable';
import { Serializable, JSONArray, serialize } from './serializable';
import { Enumerable } from './enumerable';
import { Constructable } from './constructable';
import { likeArray } from '@blue/util';

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

    static readonly MAX_CAPACITY: number;
    static readonly MIN_CAPACITY: number;

    [n: number]: T;

    get [Symbol.toStringTag](): string {
        return 'RingBuffer';
    }

    get capacity(): number {
        return this._capacity;
    }

    set capacity(newCapacity: number) {
        if (typeof newCapacity !== 'number') {
            this._capacity = RingBuffer.MIN_CAPACITY;
        } else {
            this._capacity = pow2AtLeast(min(max(RingBuffer.MIN_CAPACITY, newCapacity), RingBuffer.MAX_CAPACITY));
        }
    }

    get isEmpty(): boolean {
        return !this.isFull && this._head === this._tail;
    }

    get isFull(): boolean {
        return (this._full & FULL) !== 0;
    }

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

    constructor(elements: ArrayLike<T>);
    constructor(capacity: number);
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

    [Symbol.iterator](): Iterator<T, any, undefined> {
        return new IndexedIterator<T>(this);
    }

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

    toJSON(): JSONArray {
        const { length } = this,
            list = new Array(length);
        let index = 0;
        while (index < length) {
            list[index] = serialize(this[index++]);
        }
        return list;
    }

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
 * @extends module:core.RingBuffer
 */
export class ResizableRingBuffer<T> extends RingBuffer<T> {
    get [Symbol.toStringTag](): string {
        return 'ResizableRingBuffer';
    }

    /**
     * @param {Array} items
     * @returns {number} The number of items
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
     * @param {number} newCapacity
     * @returns {number} The number of items
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
 * @see module:core.AsEnumerableRingBuffer
 * @implements module:core.Enumerable
 * @returns {module:core.Constructable<module:core.RingBuffer,module:core.Enumerable>}
 */
export const AsEnumerableRingBuffer = <T extends Constructable<RingBuffer>, K extends keyof T, V>(
    superclass: T
): Constructable<Enumerable<K, V> & RingBuffer> & T =>
    class extends superclass implements Enumerable<K, V> {
        entries(): Iterator<[K, V]> {
            return new EntriesIterator<V>(this) as Iterator<[K, V]>;
        }

        forEach(callback: (value: V, key: K, list: Enumerable<K, V>) => void, context?: any): void {
            const length = this.length;
            if (length) {
                for (let index = 0; index < length; index++) {
                    callback.call(context || this, this[index], index, this);
                }
            }
        }

        keys(): Iterator<K> {
            return new KeysIterator(this) as Iterator<K>;
        }

        values(): Iterator<V> {
            return new ValuesIterator(this);
        }
    };

/**
 * Extension of the {@link external:Map|Map} interface that stores multiple values under a single key.
 * @extends external:Map
 */
export class MultiValueMap<K, V> extends Map<K, V[]> {
    get [Symbol.toStringTag](): string {
        return 'MultiValueMap';
    }

    /**
     * @param {*} key
     * @param {*} value
     * @returns {module:core.MultiValueMap} this
     */
    add(key: K, value: V): this {
        const values: V[] = this.has(key) ? this.get(key) : [];
        values.push(value);
        return super.set(key, values);
    }
}
