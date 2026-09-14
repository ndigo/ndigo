/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import isString from './is-string.js';

/**
 * Determines whether a given object is an array-like.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not  is an array-like.
 * @example
 * likeArray( [] );
 * //=> true
 * likeArray( '' );
 * //=> true
 * likeArray( { 0: 'zero', 9: 'nine', length: 10 } );
 * //=> true
 * likeArray( { length: 0 } );
 * //=> true
 * likeArray( { length: 10 } );
 * //=> false
 * likeArray( {} );
 * //=> false
 */
const likeArray = (value: unknown): value is ArrayLike<unknown> => {
    if (value == null) return false;
    if (Array.isArray(value) || isString(value)) return true;
    if (typeof value !== 'object') return false;
    // Arbitrary structured input: DOM nodes and array-likes via generic property reflection
    const record = value as Record<string, unknown>;
    const length: unknown = record.length;
    if (record.nodeType === 1) return typeof length === 'number' && length > 0;
    if (length === 0) return true;
    if (typeof length === 'number' && length > 0) return '0' in value && String(length - 1) in value;
    return false;
};

export default likeArray;
