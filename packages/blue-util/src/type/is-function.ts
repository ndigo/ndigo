/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { is } from 'ramda';

/**
 * Determines whether a given object is a function.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a function.
 * @example
 * isFunction( new Function() );
 * //=> true
 * isFunction( () => void 0 );
 * //=> true
 * isFunction( function(){} );
 * //=> true
 * isFunction( {} );
 * //=> false
 */
const isFunction = is(Function) as (value) => value is Function;

export default isFunction;
