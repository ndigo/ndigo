/**
 * @author Jeff Rose
 */
import { Serializable, JSONArray } from './serializable';
import { Enumerable } from './enumerable';
import { Constructable } from './constructable';
/**
 * @class module:core.RingBuffer
 * @implements external:ArrayLike
 * @implements external:Iterable
 * @implements module:core.Serializable
 */
export declare class RingBuffer<T = any> implements ArrayLike<T>, Iterable<T>, Serializable {
    protected _capacity: number;
    protected _head: number;
    protected _tail: number;
    protected _full: number;
    static readonly MAX_CAPACITY: number;
    static readonly MIN_CAPACITY: number;
    [n: number]: T;
    get [Symbol.toStringTag](): string;
    get capacity(): number;
    set capacity(newCapacity: number);
    get isEmpty(): boolean;
    get isFull(): boolean;
    get length(): number;
    constructor(elements: ArrayLike<T>);
    constructor(capacity: number);
    [Symbol.iterator](): Iterator<T, any, undefined>;
    get(): T;
    put(...items: T[]): number;
    toJSON(): JSONArray;
    toString(): string;
}
/**
 * @class module:core.ResizableRingBuffer
 * @extends module:core.RingBuffer
 */
export declare class ResizableRingBuffer<T> extends RingBuffer<T> {
    get [Symbol.toStringTag](): string;
    /**
     * @function module:core.ResizableRingBuffer#put
     * @param {external:Array} items
     * @returns {external:number} The number of items
     */
    put(...items: T[]): number;
    /**
     * @function module:core.ResizableRingBuffer#resizeTo
     * @param {external:number} newCapacity
     * @returns {external:number} The number of items
     */
    resizeTo(newCapacity: number): void;
}
/**
 * @mixin module:core.AsEnumerableRingBuffer
 * @implements module:core.Enumerable
 * @returns {module:core.Constructable<module:core.RingBuffer,module:core.Enumerable>}
 */
export declare const AsEnumerableRingBuffer: <T extends Constructable<RingBuffer>, K extends keyof T, V>(superclass: T) => Constructable<Enumerable<K, V> & RingBuffer> & T;
/**
 * Extension of the {@linkcode external:Map|Map} interface that stores multiple values under a single key.
 * @class module:core.MultiValueMap
 * @extends external:Map
 */
export declare class MultiValueMap<K, V> extends Map<K, V[]> {
    get [Symbol.toStringTag](): string;
    /**
     * @function module:core.MultiValueMap#add
     * @param {*} key
     * @param {*} value
     * @returns {module:core.MultiValueMap} this
     */
    add(key: K, value: V): this;
}
//# sourceMappingURL=collection.d.ts.map