/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';

/**
 * Represents an object that can be iterated over, providing methods to access its entries, keys, and values.
 * @template K - The type of the keys in the enumerable collection.
 * @template V - The type of the values in the enumerable collection.
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
    forEach(callback: (value: V, key: K, list: Enumerable<K, V>) => void, context?: any): void;
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
 * Represents an object that can be asynchronously iterated over, providing methods to access its entries, keys, and values.
 * @template K - The type of the keys in the asynchronous enumerable collection.
 * @template V - The type of the values in the asynchronous enumerable collection.
 */
export interface AsyncEnumerable<K extends PropertyKey, V> {
    /**
     * Returns an asynchronous iterator for the key-value pairs in the collection.
     * @returns An asynchronous iterator that yields `[key, value]` pairs.
     */
    entries(): AsyncIterator<[K, V]>;
    /**
     * Executes a provided function once for each key-value pair in the collection.
     * @param callback - Function to execute for each element. It receives `value`, `key`, and the `list` itself as arguments.
     * @param context - Value to use as `this` when executing the `callback`.
     */
    forEach(callback: (value: V, key: K, list: AsyncEnumerable<K, V>) => void, context?: any): void;
    /**
     * Returns an asynchronous iterator for the keys in the collection.
     * @returns An asynchronous iterator that yields keys.
     */
    keys(): AsyncIterator<K>;
    /**
     * Returns an asynchronous iterator for the values in the collection.
     * @returns An asynchronous iterator that yields values.
     */
    values(): AsyncIterator<V>;
}

/**
 * Type guard to check if a value implements either the `Enumerable` or `AsyncEnumerable` interface.
 * @param value - The value to be tested.
 * @returns `true` if the `value` is `Enumerable` or `AsyncEnumerable`, `false` otherwise.
 */
export const likeEnumerable = like({ entries: Function, forEach: Function, keys: Function, values: Function }) as (
    value
) => value is AsyncEnumerable<any, any> | Enumerable<any, any>;
