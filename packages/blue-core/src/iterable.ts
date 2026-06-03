/**
 * @author Jeff Rose
 */

import { isNil, is } from '@blue/util/types';

/**
 * Extracts the key type from a Map-like value.
 * @template Value - The Map-like value type.
 */
type MapKey<Value> = Value extends Map<infer KeyType, unknown> ? KeyType : unknown;

/**
 * Extracts the value type from a Map-like value.
 * @template Value - The Map-like value type.
 */
type MapValue<Value> = Value extends Map<unknown, infer ValueType> ? ValueType : unknown;

/**
 * Represents an array of entries for an array-like value, where each entry is `[index, value]`.
 * @template Value - The array-like value type.
 */
type ArrayEntries<Value extends readonly unknown[]> = Array<ArrayEntry<Value>>;

/**
 * Represents an array of entries for a Map-like value, where each entry is `[key, value]`.
 * @template Value - The Map-like value type.
 */
type MapEntries<Value> = Array<MapEntry<Value>>;

/**
 * Represents an array of entries for an object-like value, where each entry is `[key, value]`.
 * @template Value - The object-like value type.
 */
type ObjectEntries<Value> = Array<ObjectEntry<Value>>;

/**
 * Represents an array of entries for a Set-like value, where each entry is `[value, value]`.
 * @template Value - The Set-like value type.
 */
type SetEntries<Value extends Set<unknown>> = Array<SetEntry<Value>>;

/**
 * Represents a single entry for an array-like value, where the entry is `[index, value]`.
 * @template Value - The array-like value type.
 */
export type ArrayEntry<Value extends readonly unknown[]> = [number, Value[number]];

/**
 * Represents a single entry for a Map-like value, where the entry is `[key, value]`.
 * @template Value - The Map-like value type.
 */
export type MapEntry<Value> = [MapKey<Value>, MapValue<Value>];

/**
 * Represents a single entry for an object-like value, where the entry is `[key, value]`.
 * @template Value - The object-like value type.
 */
export type ObjectEntry<Value> = [keyof Value, Value[keyof Value]];

/**
 * Represents a single entry for a Set-like value, where the entry is `[value, value]`.
 * @template Value - The Set-like value type.
 */
export type SetEntry<Value> = Value extends Set<infer ValueType> ? [ValueType, ValueType] : never;

/**
 * Represents a generic entry type, which can be an `ArrayEntry`, `MapEntry`, `ObjectEntry`, or `SetEntry`.
 * @template Value - The original value type from which the entry is derived.
 */
export type Entry<Value> =
    Value extends Map<unknown, unknown>
        ? MapEntry<Value>
        : Value extends Set<unknown>
          ? SetEntry<Value>
          : Value extends unknown[]
            ? ArrayEntry<Value>
            : Value extends object
              ? ObjectEntry<Value>
              : never;

/**
 * Represents a generic collection of entries, which can be `MapEntries`, `SetEntries`, `ArrayEntries`, or `ObjectEntries`.
 * @template Value - The original value type from which the entries are derived.
 */
export type Entries<Value> =
    Value extends Map<unknown, unknown>
        ? MapEntries<Value>
        : Value extends Set<unknown>
          ? SetEntries<Value>
          : Value extends unknown[]
            ? ArrayEntries<Value>
            : Value extends object
              ? ObjectEntries<Value>
              : never;

const { isArray } = Array,
    { entries } = Object,
    propIs = (type) => (name) => (obj) => is(type, obj?.[name]),
    hasFunction = propIs(Function),
    hasEntries = hasFunction('entries'),
    _invokeEntries = (obj: any) => obj.entries(),
    _T = (): boolean => true,
    _entriesToIterator = (obj: object) => indexedIterator(entries(obj));

/**
 * Type guard to check if a value is an entry (a two-element array).
 * @param value - The value to be tested.
 * @returns `true` if the value is an entry, `false` otherwise.
 */
export const isEntry = (value: any): value is Entry<any> => isArray(value) && value.length === 2;

/**
 * Type guard to check if a value is an array of entries.
 * @param value - The value to be tested.
 * @returns `true` if the value is an array of entries, `false` otherwise.
 */
export const isEntries = (value: any): value is Entry<any> =>
    isArray(value) && (value.length ? isEntry(value[0]) : true);

/**
 * Type guard to check if a value is iterable (has a `Symbol.iterator` method).
 * @param value - The value to be tested.
 * @returns `true` if the value is iterable, `false` otherwise.
 */
export const likeIterable = (value: any): value is Iterable<any> =>
    !isNil(value) && value[Symbol.iterator] !== undefined;

/**
 * An iterator for array-like objects, providing sequential access to elements by index.
 * @template T - The type of elements in the indexed collection.
 * @implements {IterableIterator}
 */
export class IndexedIterator<T = any> implements IterableIterator<T> {
    #indexed: ArrayLike<T>;
    #index: number;

    /**
     * Returns the iterator itself, making this class compliant with the iterable protocol.
     * @returns The current `IndexedIterator` instance.
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    /**
     * Creates an instance of IndexedIterator.
     * @param indexed - The array-like collection to iterate over.
     */
    constructor(indexed: ArrayLike<T>) {
        this.#indexed = indexed;
        this.#index = 0;
    }

    /**
     * Returns the next element in the iteration sequence.
     * @returns An `IteratorResult` object containing the next value and a `done` flag.
     */
    next(): IteratorResult<T> {
        if (this.#index < this.#indexed.length) {
            return { done: false, value: this.#indexed[this.#index++] };
        } else {
            return { done: true } as IteratorResult<T>;
        }
    }
}

/**
 * Creates a new `IndexedIterator` for an array-like collection.
 * @template T - The type of elements in the indexed collection.
 * @param indexed - The array-like collection to iterate over.
 * @returns An `IterableIterator` for the provided collection.
 */
export const indexedIterator = <T = any>(indexed: ArrayLike<T>): IterableIterator<T> => new IndexedIterator<T>(indexed);

/**
 * An iterator for the key-value pairs (entries) of an object or collection.
 * It can adapt to objects with an `entries()` method, or fall back to `Object.entries()`.
 * @template T - The type of values in the entries.
 * @implements external:IterableIterator
 */
export class EntriesIterator<T = any> implements IterableIterator<Entry<T>> {
    #iterator: Iterator<Entry<T>>;

    /**
     * Creates an instance of EntriesIterator.
     * @param target - The object or collection to iterate over its entries.
     */
    constructor(target: object) {
        this.#iterator = (hasEntries(target)
            ? _invokeEntries(target)
            : _entriesToIterator(target)
        ) as Iterator<Entry<T>>;
    }

    /**
     * Returns the iterator itself, making this class compliant with the iterable protocol.
     * @returns The current `EntriesIterator` instance.
     */
    [Symbol.iterator](): IterableIterator<Entry<T>> {
        return this;
    }

    /**
     * Returns the next entry in the iteration sequence.
     * @returns An `IteratorResult` object containing the next entry and a `done` flag.
     */
    next(): IteratorResult<Entry<T>> {
        return this.#iterator.next();
    }
}

/**
 * Creates a new `EntriesIterator` for an object or collection.
 * @template T - The type of values in the entries.
 * @param target - The object or collection to iterate over its entries.
 * @returns An `IterableIterator` for the entries of the provided target.
 */
export const entriesIterator = <T = any>(target: object): IterableIterator<Entry<T>> => new EntriesIterator<T>(target);
