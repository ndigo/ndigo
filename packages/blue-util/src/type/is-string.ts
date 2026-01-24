/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { is } from 'ramda';

/**
 * Determines whether a given object is a string.
 * @function module:util.isString
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is a string.
 * @example
 * isString( new String( 'hello' ) );
 * //=> true
 * isString( 'hello' } );
 * //=> true
 * isString( {} );
 * //=> false
 */
const isString = is(String) as (value) => value is string;

export default isString;
