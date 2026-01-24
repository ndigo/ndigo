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
 * @class module:core.RingBuffer
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
 * @class module:core.ResizableRingBuffer
 * @extends module:core.RingBuffer
 */
export class ResizableRingBuffer extends RingBuffer {
    get [Symbol.toStringTag]() {
        return 'ResizableRingBuffer';
    }
    /**
     * @function module:core.ResizableRingBuffer#put
     * @param {external:Array} items
     * @returns {external:number} The number of items
     */
    put(...items) {
        const length = this.length, itemsLength = items.length, totalLength = itemsLength + length;
        if (totalLength > this._capacity) {
            this.resizeTo(totalLength);
        }
        return super.put.apply(this, items);
    }
    /**
     * @function module:core.ResizableRingBuffer#resizeTo
     * @param {external:number} newCapacity
     * @returns {external:number} The number of items
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
 * @mixin module:core.AsEnumerableRingBuffer
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
 * Extension of the {@linkcode external:Map|Map} interface that stores multiple values under a single key.
 * @class module:core.MultiValueMap
 * @extends external:Map
 */
export class MultiValueMap extends Map {
    get [Symbol.toStringTag]() {
        return 'MultiValueMap';
    }
    /**
     * @function module:core.MultiValueMap#add
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