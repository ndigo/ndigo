/**
 * @author Jeff Rose
 */
import { EntriesIterator, IndexedIterator, KeysIterator, ValuesIterator } from './iterable';
import { serialize } from './serializable';
import { likeArray } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1RixPQUFPLEVBQTJCLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3BFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU3QyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQ25CLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUNiLElBQUksR0FBRyxDQUFVLEdBQVEsRUFBRSxRQUFnQixFQUFFLEdBQVEsRUFBRSxRQUFnQixFQUFFLE1BQWMsRUFBUSxFQUFFO0lBQzdGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQztRQUM5QyxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7QUFDTCxDQUFDLEVBQ0QsV0FBVyxHQUFHLENBQUMsQ0FBUyxFQUFVLEVBQUU7SUFDaEMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDWixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxD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