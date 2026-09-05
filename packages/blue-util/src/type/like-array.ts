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
const likeArray = (value: any): value is ArrayLike<any> => {
    if (value == null) return false;
    if (Array.isArray(value) || isString(value)) return true;
    if (typeof value !== 'object') return false;
    if (value.nodeType === 1) return value.length > 0;
    if (value.length === 0) return true;
    if (value.length > 0) return '0' in value && String(value.length - 1) in value;
    return false;
};

export default likeArray;
