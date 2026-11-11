/**
 * A dynamic double-ended queue with O(1) amortized push/pop on both ends.
 *
 * Backed by a circular buffer that grows by doubling when full, so logical
 * capacity is unbounded (unlike {@link RingBuffer}, which has a fixed cap).
 * Exact-size bounding is done by the caller (`if (deque.length > cap) deque.shift()`),
 * which is itself O(1).
 */
import { Serializable, JSONArray, serialize } from './serializable.js';
import { Equatable } from './equatable.js';

export class Deque<T> implements ArrayLike<T | undefined>, Iterable<T>, Serializable, Equatable<Deque<T>> {
    #capacity: number;
    #mask: number;
    #buffer: Array<T | undefined>;
    #head: number = 0;
    #size: number = 0;

    get [Symbol.toStringTag](): string {
        return 'Deque';
    }

    get length(): number {
        return this.#size;
    }

    get capacity(): number {
        return this.#capacity;
    }

    constructor(capacity: number = 16) {
        let cap = Math.max(1, Math.floor(capacity || 16));
        // round up to power of two
        cap = 1 << Math.ceil(Math.log2(cap));
        this.#capacity = cap;
        this.#mask = cap - 1;
        this.#buffer = new Array(cap);
    }

    #grow(): void {
        const newCap = this.#capacity * 2;
        const newBuf: Array<T | undefined> = new Array(newCap);
        for (let i = 0; i < this.#size; i++) {
            newBuf[i] = this.#buffer[(this.#head + i) & this.#mask];
        }
        this.#buffer = newBuf;
        this.#capacity = newCap;
        this.#mask = newCap - 1;
        this.#head = 0;
    }

    push(value: T): this {
        if (this.#size === this.#capacity) this.#grow();
        this.#buffer[(this.#head + this.#size) & this.#mask] = value;
        this.#size++;
        return this;
    }

    unshift(value: T): this {
        if (this.#size === this.#capacity) this.#grow();
        this.#head = (this.#head - 1 + this.#capacity) & this.#mask;
        this.#buffer[this.#head] = value;
        this.#size++;
        return this;
    }

    pop(): T | undefined {
        if (this.#size === 0) return undefined;
        const idx = (this.#head + this.#size - 1) & this.#mask;
        const value = this.#buffer[idx];
        this.#buffer[idx] = undefined;
        this.#size--;
        return value;
    }

    shift(): T | undefined {
        if (this.#size === 0) return undefined;
        const value = this.#buffer[this.#head];
        this.#buffer[this.#head] = undefined;
        this.#head = (this.#head + 1) & this.#mask;
        this.#size--;
        return value;
    }

    peekFront(): T | undefined {
        return this.#size === 0 ? undefined : this.#buffer[this.#head];
    }

    peekBack(): T | undefined {
        return this.#size === 0 ? undefined : this.#buffer[(this.#head + this.#size - 1) & this.#mask];
    }

    get(index: number): T | undefined {
        if (index < 0 || index >= this.#size) return undefined;
        return this.#buffer[(this.#head + index) & this.#mask];
    }

    [n: number]: T | undefined;

    clear(): void {
        this.#buffer = new Array(this.#capacity);
        this.#head = 0;
        this.#size = 0;
    }

    /**
     * Removes the first occurrence of `value` (by `===`). O(n). Intended for
     * rare removals (e.g. promoting a cached entry to permanent storage).
     *
     * @returns `true` when a value was removed.
     */
    remove(value: T): boolean {
        let index = -1;
        for (let i = 0; i < this.#size; i++) {
            if (this.get(i) === value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            return false;
        }
        const items = this.toArray();
        items.splice(index, 1);
        this.clear();
        for (const item of items) {
            this.push(item);
        }
        return true;
    }

    toArray(): T[] {
        const out: T[] = [];
        for (let i = 0; i < this.#size; i++) {
            out.push(this.#buffer[(this.#head + i) & this.#mask] as T);
        }
        return out;
    }

    *[Symbol.iterator](): Iterator<T, undefined, undefined> {
        for (let i = 0; i < this.#size; i++) {
            yield this.#buffer[(this.#head + i) & this.#mask] as T;
        }
    }

    toJSON(): JSONArray {
        return this.toArray().map((v) => serialize(v)) as JSONArray;
    }

    toString(): string {
        return this.toJSON().join(',');
    }

    equals(value: unknown): boolean {
        if (!(value instanceof Deque)) return false;
        if (value.length !== this.#size) return false;
        for (let i = 0; i < this.#size; i++) {
            if (this.get(i) !== value.get(i)) return false;
        }
        return true;
    }
}