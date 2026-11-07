/**
 * The `Enumerable` interface and `likeEnumerable` guard.
 */
import { like } from '@ndigo/util/types';

/**
 * Represents an object that can be iterated over, providing methods to access its entries, keys, and values.
 * @typeParam K - The type of the keys in the enumerable collection.
 * @typeParam V - The type of the values in the enumerable collection.
 */
export interface Enumerable<K extends PropertyKey, V> {
    /**
     * Returns an iterator for the key-value pairs in the collection.
     * @returns An iterator that yields `[key, value]` pairs.
     */
    entries(): Iterator<[K, V]>;
    /**
     * Executes a provided function once for each key-value pair in the collection.
     * @param callback - Function to execute for each element. It receives `value`, `key`, and the `list` itself as arguments.
     * @param context - Value to use as `this` when executing the `callback`.
     */
    forEach(callback: (value: V, key: K, list: Enumerable<K, V>) => void, context?: unknown): void;
    /**
     * Returns an iterator for the keys in the collection.
     * @returns An iterator that yields keys.
     */
    keys(): Iterator<K>;
    /**
     * Returns an iterator for the values in the collection.
     * @returns An iterator that yields values.
     */
    values(): Iterator<V>;
}

/**
 * Type guard to check if a value implements the `Enumerable` interface.
 * @param value - The value to be tested.
 * @returns `true` if the `value` is `Enumerable`, `false` otherwise.
 */
export const likeEnumerable = like({ entries: Function, forEach: Function, keys: Function, values: Function }) as (
    value: unknown
) => value is Enumerable<PropertyKey, unknown>;
