/**
 * @author Jeff Rose
 */
import { EntriesIterator, IndexedIterator, KeysIterator, ValuesIterator } from './iterable';
import { serialize } from './serializable';
import { likeArray } from '@blue/util';
const { defineProperty } = Reflect, { max, min } = Math, FULL = 1 << 0, move = (src, srcIndex, dst, dstIndex, length) => {
    let index = 0;
    for (; index < length; index++) {
        dst[index + dstIndex] = src[index + srcIndex];
        src[index + srcIndex] = void 0;
    }
}, pow2AtLeast = (n) => {
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
export class RingBuffer {
    _capacity;
    _head;
    _tail;
    _full;
    static MAX_CAPACITY;
    static MIN_CAPACITY;
    get [Symbol.toStringTag]() {
        return 'RingBuffer';
    }
    get capacity() {
        return this._capacity;
    }
    set capacity(newCapacity) {
        if (typeof newCapacity !== 'number') {
            this._capacity = RingBuffer.MIN_CAPACITY;
        }
        else {
            this._capacity = pow2AtLeast(min(max(RingBuffer.MIN_CAPACITY, newCapacity), RingBuffer.MAX_CAPACITY));
        }
    }
    get isEmpty() {
        return !this.isFull && this._head === this._tail;
    }
    get isFull() {
        return (this._full & FULL) !== 0;
    }
    get length() {
        let length;
        const capacity = this._capacity;
        if (this.isFull) {
            length = capacity;
        }
        else {
            const head = this._head, tail = this._tail;
            length = head >= tail ? head - tail : capacity + head - tail;
        }
        return length;
    }
    constructor(capacityOrElements = RingBuffer.MIN_CAPACITY) {
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
        }
        else if (likeArray(capacityOrElements)) {
            this.put.apply(this, capacityOrElements);
        }
    }
    [Symbol.iterator]() {
        return new IndexedIterator(this);
    }
    get() {
        let item;
        if (this.length) {
            const tail = this._tail;
            item = this[tail];
            this[tail] = void 0;
            this._tail = (tail + 1) & (this._capacity - 1);
            this._full = this._full & ~FULL;
        }
        return item;
    }
    put(...items) {
        const itemsLength = items.length;
        if (itemsLength) {
            const last = this._capacity - 1;
            let index = 0, head = this._head;
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
    toJSON() {
        const { length } = this, list = new Array(length);
        let index = 0;
        while (index < length) {
            list[index] = serialize(this[index++]);
        }
        return list;
    }
    toString() {
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
export class ResizableRingBuffer extends RingBuffer {
    get [Symbol.toStringTag]() {
        return 'ResizableRingBuffer';
    }
    /**
     * @param {Array} items
     * @returns {number} The number of items
     */
    put(...items) {
        const length = this.length, itemsLength = items.length, totalLength = itemsLength + length;
        if (totalLength > this._capacity) {
            this.resizeTo(totalLength);
        }
        return super.put.apply(this, items);
    }
    /**
     * @param {number} newCapacity
     * @returns {number} The number of items
     */
    resizeTo(newCapacity) {
        const oldCapacity = this._capacity, head = this._head, tail = this._tail;
        this.capacity = newCapacity;
        if (tail < head) {
            const newHead = this.length;
            move(this, tail, this, 0, newHead);
            this._tail = 0;
            this._head = newHead;
        }
        else if (tail > head) {
            const newHead = oldCapacity - tail;
            move(this, tail, this, 0, newHead);
            move(this, 0, this, newHead, head);
            this._tail = 0;
            this._head = newHead;
        }
        else if (tail === head) {
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
export const AsEnumerableRingBuffer = (superclass) => class extends superclass {
    entries() {
        return new EntriesIterator(this);
    }
    forEach(callback, context) {
        const length = this.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                callback.call(context || this, this[index], index, this);
            }
        }
    }
    keys() {
        return new KeysIterator(this);
    }
    values() {
        return new ValuesIterator(this);
    }
};
/**
 * Extension of the {@link external:Map|Map} interface that stores multiple values under a single key.
 * @extends external:Map
 */
export class MultiValueMap extends Map {
    get [Symbol.toStringTag]() {
        return 'MultiValueMap';
    }
    /**
     * @param {*} key
     * @param {*} value
     * @returns {module:core.MultiValueMap} this
     */
    add(key, value) {
        const values = this.has(key) ? this.get(key) : [];
        values.push(value);
        return super.set(key, values);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1RixPQUFPLEVBQTJCLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3BFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdkMsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUNuQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDYixJQUFJLEdBQUcsQ0FBVSxHQUFRLEVBQUUsUUFBZ0IsRUFBRSxHQUFRLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQVEsRUFBRTtJQUM3RixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUM3QixHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0FBQ0wsQ0FBQyxFQUNELFdBQVcsR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFO0lBQ2hDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ1osQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FB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