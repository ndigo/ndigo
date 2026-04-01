/**
 * @author Jeff Rose
 */

import { T, invoker, pipe } from '@blue/util/function';
import { complement, cond } from '@blue/util/logic';
import { prop } from '@blue/util/object';
import { likeArray, isNil, is } from '@blue/util/types';

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
    { entries, keys, values } = Object,
    propIs = (type) => (name) => (obj) => is(type, prop(name, obj)),
    hasFunction = propIs(Function),
    hasEntries = hasFunction('entries'),
    hasKeys = hasFunction('keys'),
    hasValues = hasFunction('values'),
    invokeEntries = invoker(0, 'entries'),
    invokeKeys = invoker(0, 'keys'),
    invokeValues = invoker(0, 'values');

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
    complement(isNil)(value) && value[Symbol.iterator] !== undefined;

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
        this.#iterator = cond([
            [hasEntries, invokeEntries],
            [T, pipe(entries, indexedIterator)],
        ])(target) as Iterator<Entry<T>>;
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

/**
 * An iterator for the keys (property names) of an object or collection.
 * It can adapt to objects with a `keys()` method, or fall back to `Object.keys()`.
 * @implements external:IterableIterator
 */
export class KeysIterator implements IterableIterator<PropertyKey> {
    #iterator: Iterator<PropertyKey>;

    /**
     * Creates an instance of KeysIterator.
     * @param target - The object or collection to iterate over its keys.
     */
    constructor(target: object) {
        this.#iterator = cond([
            [hasKeys, invokeKeys],
            [T, pipe(keys, indexedIterator)],
        ])(target);
    }

    /**
     * Returns the iterator itself, making this class compliant with the iterable protocol.
     * @returns The current `KeysIterator` instance.
     */
    [Symbol.iterator](): IterableIterator<PropertyKey> {
        return this;
    }

    /**
     * Returns the next key in the iteration sequence.
     * @returns An `IteratorResult` object containing the next key and a `done` flag.
     */
    next(): IteratorResult<PropertyKey> {
        return this.#iterator.next();
    }
}

/**
 * Creates a new `KeysIterator` for an object or collection.
 * @param target - The object or collection to iterate over its keys.
 * @returns An `IterableIterator` for the keys of the provided target.
 */
export const keysIterator = (target: object): IterableIterator<PropertyKey> => new KeysIterator(target);

/**
 * An iterator for the values of an object or collection.
 * It can adapt to objects with a `values()` method, or fall back to `Object.values()`.
 * @template T - The type of values being iterated.
 * @implements external:IterableIterator
 */
export class ValuesIterator<T = any> implements IterableIterator<T> {
    #iterator: Iterator<T>;

    /**
     * Creates an instance of ValuesIterator.
     * @param target - The object or collection to iterate over its values.
     */
    constructor(target: object) {
        this.#iterator = cond([
            [hasValues, invokeValues],
            [T, pipe(values, indexedIterator)],
        ])(target);
    }

    /**
     * Returns the iterator itself, making this class compliant with the iterable protocol.
     * @returns The current `ValuesIterator` instance.
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    /**
     * Returns the next value in the iteration sequence.
     * @returns An `IteratorResult` object containing the next value and a `done` flag.
     */
    next(): IteratorResult<T> {
        return this.#iterator.next();
    }
}

/**
 * Creates a new `ValuesIterator` for an object or collection.
 * @template T - The type of values being iterated.
 * @param target - The object or collection to iterate over its values.
 * @returns An `IterableIterator` for the values of the provided target.
 */
export const valuesIterator = <T = any>(target: object): IterableIterator<T> => new ValuesIterator<T>(target);

/**
 * An iterator that generates a sequence of numbers within a specified range.
 * @implements {IterableIterator}
 */
export class RangeIterator implements IterableIterator<number> {
    #end: number;
    #step: number;
    #index: number;

    /**
     * Returns the iterator itself, making this class compliant with the iterable protocol.
     * @returns The current `RangeIterator` instance.
     */
    [Symbol.iterator](): IterableIterator<number> {
        return this;
    }

    /**
     * Creates an instance of RangeIterator.
     * @param startOrEnd - The starting number of the range, or the ending number if `end` is not provided.
     * @param end - The ending number of the range (exclusive).
     * @param step - The amount by which values are incremented in each step. Defaults to 1. Cannot be 0.
     * @throws {RangeError} If `step` is 0.
     */
    constructor(startOrEnd: number, end?: number, step?: number) {
        if (step === 0) {
            throw new RangeError('"step" cannot be 0');
        } else if (typeof end === 'undefined') {
            this.#index = 0;
            this.#end = startOrEnd;
            this.#step = 1;
        } else if (typeof step === 'undefined') {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = 1;
        } else {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = step;
        }
    }

    /**
     * Returns the next number in the range sequence.
     * @returns An `IteratorResult` object containing the next number and a `done` flag.
     */
    next(): IteratorResult<number> {
        const end = this.#end,
            index = this.#index,
            step = this.#step;
        if ((step > 0 && index < end) || (step < 0 && index > end)) {
            const result = { done: false, value: index };
            this.#index += step;
            return result;
        } else {
            return { done: true } as any;
        }
    }
}

/**
 * Creates a new `RangeIterator` that generates a sequence of numbers within a specified range.
 * @param startOrEnd - The starting number of the range, or the ending number if `end` is not provided.
 * @param end - The ending number of the range (exclusive).
 * @param step - The amount by which values are incremented in each step. Defaults to 1. Cannot be 0.
 * @returns An `IterableIterator` for the specified range.
 * @throws {RangeError} If `step` is 0.
 */
export const rangeIterator = (startOrEnd: number, end?: number, step?: number): IterableIterator<number> =>
    new RangeIterator(startOrEnd, end, step);

/**
 * Returns an iterator for a given collection. It can handle `Iterable` objects and array-like objects.
 * @template T - The type of elements in the collection.
 * @param collection - The collection to get an iterator for.
 * @returns An `Iterator` for the provided collection.
 * @throws {TypeError} If the `collection` is not iterable or array-like.
 */
export const getIterator = cond([
    [likeIterable, (iterable) => iterable[Symbol.iterator]()],
    [likeArray, indexedIterator],
    [
        T,
        () => {
            throw new TypeError('"collection" is not iterable.');
        },
    ],
]) as <T = any>(value) => Iterator<T>;
