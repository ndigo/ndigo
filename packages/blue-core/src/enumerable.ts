/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';

export interface Enumerable<K extends PropertyKey, V> {
    entries(): Iterator<[K, V]>;
    forEach(callback: (value: V, key: K, list: Enumerable<K, V>) => void, context?: any): void;
    keys(): Iterator<K>;
    values(): Iterator<V>;
}

export interface AsyncEnumerable<K extends PropertyKey, V> {
    entries(): AsyncIterator<[K, V]>;
    forEach(callback: (value: V, key: K, list: AsyncEnumerable<K, V>) => void, context?: any): void;
    keys(): AsyncIterator<K>;
    values(): AsyncIterator<V>;
}

/**
 */

/**
 * @callback module:core.Enumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {Enumerable} list
 */

/**
 * @returns {Iterator}
 */

/**
 * @param {module:core.Enumerable~ForEachCallback} callback
 * @param {*} [context]
 */

/**
 * @returns {Iterator}
 */

/**
 * @returns {Iterator}
 */

/**
 */

/**
 * @callback module:core.AsyncEnumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {EnumeraAsyncEnumerableble} list
 */

/**
 * @returns {Iterator}
 */

/**
 * @param {module:core.AsyncEnumerable~ForEachCallback} callback
 * @param {*} [context]
 */

/**
 * @returns {Iterator}
 */

/**
 * @returns {Iterator}
 */

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Enumerable|Enumerable} or {@link AsyncEnumerable|AsyncEnumerable}.
 */
export const likeEnumerable = like({ entries: Function, forEach: Function, keys: Function, values: Function }) as (
    value
) => value is AsyncEnumerable<any, any> | Enumerable<any, any>;
