/**
 * @author Jeff Rose
 */

import { like } from '@blue/util';

export interface Enumerable<K extends PropertyKey, V> {
    entries(): Iterator<[ K, V ]>;
    forEach( callback: ( value: V, key: K, list: Enumerable<K, V> ) => void, context?: any ): void;
    keys(): Iterator<K>;
    values(): Iterator<V>;
}

export interface AsyncEnumerable<K extends PropertyKey, V> {
    entries(): AsyncIterator<[ K, V ]>;
    forEach( callback: ( value: V, key: K, list: AsyncEnumerable<K, V> ) => void, context?: any ): void;
    keys(): AsyncIterator<K>;
    values(): AsyncIterator<V>;
}

/**
 * @interface module:core.Enumerable
 */

/**
 * @callback module:core.Enumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {Enumerable} list
 */

/**
 * @function module:core.Enumerable#entries
 * @returns {external:Iterator}
 */

/**
 * @function module:core.Enumerable#forEach
 * @param {module:core.Enumerable~ForEachCallback} callback
 * @param {*} [context]
 */

/**
 * @function module:core.Enumerable#keys
 * @returns {external:Iterator}
 */

/**
 * @function module:core.Enumerable#values
 * @returns {external:Iterator}
 */

/**
 * @interface module:core.AsyncEnumerable
 */

 /**
 * @callback module:core.AsyncEnumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {EnumeraAsyncEnumerableble} list
 */

/**
 * @function module:core.AsyncEnumerable#entries
 * @returns {external:Iterator}
 */

/**
 * @function module:core.AsyncEnumerable#forEach
 * @param {module:core.AsyncEnumerable~ForEachCallback} callback
 * @param {*} [context]
 */

/**
 * @function module:core.AsyncEnumerable#keys
 * @returns {external:Iterator}
 */

/**
 * @function module:core.AsyncEnumerable#values
 * @returns {external:Iterator}
 */

/**
 * @function module:core.likeEnumerable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Enumerable|Enumerable} or {@linkcode module:core.AsyncEnumerable|AsyncEnumerable}.
 */
export const likeEnumerable = like( { entries: Function, forEach: Function, keys: Function, values: Function } ) as ( value ) => value is ( AsyncEnumerable<any, any> | Enumerable<any, any> );
