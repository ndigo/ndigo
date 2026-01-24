/**
 * @author Jeff Rose
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @see {@link https://ramdajs.com/docs/}
 */

import {
    allPass,
    complement,
    curry,
    either,
    equals,
    has,
    is,
    isNil,
    map,
    pipe,
    prepend,
    propSatisfies,
    toPairs,
} from 'ramda';

export type LikeDescriptor = { [key: string]: Function | true };

/**
 * Determines whether a given value matches the criteria.
 * @function module:util.like
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` matches the criteria.
 * @example
 * const wxy = { w: true, x: Number, y: Number };
 * like( wxy, { w: {}, x: 123, y: 456 } );
 * //=> true
 * like( wxy, { w: 'abc', x: 123, z: 789 } );
 * //=> false
 *
 * const likeWXY = like( wxy );
 * likeWXY( { w: {}, x: 123, y: 456 } );
 * //=> true
 * likeWXY( { w: 'abc', x: 123, y: 456, z: 789 } );
 * //=> true
 * likeWXY( { w: true, x: 123, y: '456' } );
 * //=> false
 * likeWXY( { w: 0, x: 123, z: 789 } );
 * //=> false
 * @see {@link https://en.wikipedia.org/wiki/Duck_typing}
 */
const isDefined = complement(isNil),
    isNull = equals(null),
    toPredicate = ([key, type]: [string, Function | true]) =>
        type === true ? has(key) : propSatisfies(either(is(type as any), isNull), key),
    // @ts-ignore
    toPredicates = pipe(toPairs, map(toPredicate), prepend(isDefined)),
    likeDescriptor = pipe(toPredicates, allPass) as (descriptor: LikeDescriptor) => (value) => boolean,
    like = (descriptor: LikeDescriptor, value): boolean => likeDescriptor(descriptor)(value);
export default curry(like);
