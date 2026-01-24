/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { __, both, cond, dec, either, F, gt, has, isNil, length, pipe, propEq, propSatisfies, T, toString } from 'ramda';
import isString from './is-string';

/**
 * Determines whether a given object is an array-like.
 * @function module:util.likeArray
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is an array-like.
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
const
    nodeTypeEqualsOne = propEq( 'nodeType', 1 ),
    lengthEqualsZero = propEq( 'length', 0 ),
    lengthGreaterThanZero = propSatisfies( gt( __, 0 ), 'length' ),
    lastIndex = pipe( length, dec, toString ),
    hasZero = has( '0' ),
    hasLastIndex = ( value ) => has( lastIndex( value ), value ),
    isNotObject = ( value ) => typeof value !== 'object',
    likeArray = cond<any, boolean>( [
        [ isNil, F ],
        [ either<any>( Array.isArray, isString ), T ],
        [ isNotObject, F ],
        [ nodeTypeEqualsOne, lengthGreaterThanZero ],
        [ lengthEqualsZero, T ],
        [ lengthGreaterThanZero, both<any>( hasZero, hasLastIndex ) ],
        [ T, F ]
    ] ) as ( value ) => value is ArrayLike<any>;

export default likeArray;
