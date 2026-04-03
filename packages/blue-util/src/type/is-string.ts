/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

/**
 * Determines whether a given object is a string.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a string.
 * @example
 * isString( new String( 'hello' ) );
 * //=> true
 * isString( 'hello' } );
 * //=> true
 * isString( {} );
 * //=> false
 */
const isString = (value: any): value is string => typeof value === 'string' || value instanceof String;

export default isString;
