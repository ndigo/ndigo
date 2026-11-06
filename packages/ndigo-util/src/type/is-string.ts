/**
 */
/**
 * Determines whether a given object is a string.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a string.
 * @example
 * isString( new String( 'hello' ) );
 * //=> true
 * isString( 'hello' );
 * //=> true
 * isString( {} );
 * //=> false
 */
const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

export default isString;
