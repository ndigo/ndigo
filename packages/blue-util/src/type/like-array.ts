/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import {
    __,
    both,
    cond,
    dec,
    either,
    equals,
    F,
    gt,
    has,
    isNil,
    length,
    pipe,
    propSatisfies,
    T,
    toString,
} from 'ramda';
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
const nodeTypeEqualsOne = propSatisfies(equals(1), 'nodeType'),
    lengthEqualsZero = propSatisfies(equals(0), 'length'),
    lengthGreaterThanZero = propSatisfies(gt(__, 0), 'length'),
    lastIndex = pipe(length, dec, toString),
    hasZero = has('0'),
    hasLastIndex = (value) => has(lastIndex(value), value),
    isNotObject = (value) => typeof value !== 'object',
    // @ts-expect-error - cond is typed as any in our ramda.d.ts
    likeArray = cond<any, boolean>([
        [isNil, F],
        // @ts-expect-error - either is typed as any in our ramda.d.ts
        [either<any>(Array.isArray, isString), T],
        [isNotObject, F],
        [nodeTypeEqualsOne, lengthGreaterThanZero],
        [lengthEqualsZero, T],
        // @ts-expect-error - both is typed as any in our ramda.d.ts
        [lengthGreaterThanZero, both<any>(hasZero, hasLastIndex)],
        [T, F],
    ]) as (value) => value is ArrayLike<any>;

export default likeArray;
