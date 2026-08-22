/**
 * @author Jeff Rose
 */
import { Serializable, JSONArray } from './serializable.js';
export declare class RingBuffer<T = any> implements ArrayLike<T | undefined>, Iterable<T>, Serializable {
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
    [n: number]: T | undefined;
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * The current capacity of the ring buffer.
     */
    get capacity(): number;
    /**
     * Sets the capacity of the ring buffer. The new capacity will be a power of 2
     * between `MIN_CAPACITY` and `MAX_CAPACITY`.
     * @param newCapacity - The desired new capacity.
     */
    set capacity(newCapacity: number);
    /**
     * Indicates if the ring buffer is empty.
     */
    get isEmpty(): boolean;
    /**
     * Indicates if the ring buffer is full.
     */
    get isFull(): boolean;
    /**
     * The number of elements currently in the ring buffer.
     */
    get length(): number;
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
     * Returns an iterator for the elements in the ring buffer.
     * @returns An iterator for the elements.
     */
    [Symbol.iterator](): Iterator<T, any, undefined>;
    /**
     * Retrieves and removes the oldest element from the ring buffer.
     * @returns The oldest element, or `undefined` if the buffer is empty.
     */
    get(): T | undefined;
    /**
     * Returns the oldest element (tail position) without removing it.
     * @returns The oldest element, or `undefined` if the buffer is empty.
     */
    peek(): T | undefined;
    /**
     * Returns the newest element (most recently added, head-1 position) without removing it.
     * @returns The newest element, or `undefined` if the buffer is empty.
     */
    peekHead(): T | undefined;
    /**
     * Adds one or more elements to the ring buffer. If the buffer is full,
     * the oldest elements will be overwritten.
     * @param items - The elements to add.
     * @returns The new length of the ring buffer.
     */
    put(...items: T[]): number;
    /**
     * Returns a JSON array representation of the ring buffer's contents.
     * @returns A JSON array.
     */
    toJSON(): JSONArray;
    /**
     * Returns a string representation of the ring buffer's contents.
     * @returns A comma-separated string of the elements.
     */
    toString(): string;
}
