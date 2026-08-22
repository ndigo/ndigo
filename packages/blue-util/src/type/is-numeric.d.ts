/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
export type Numeric = number | `${number}`;
/**
 * Determines whether a given value is numeric, i.e. a number or a string containing a number. The {@link isNumber|isNumber} method determines whether the value, parsed or not, is a number.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is numeric.
 * @example
 * isNumeric( new Number( 1 ) );
 * //=> true
 * isNumeric( 2 );
 * //=> true
 * isNumeric( '2' );
 * //=> true
 * isNumeric( NaN );
 * //=> false
 * isNumeric( Infinity );
 * //=> false
 * @see {@link isNumber}
 */
declare const isNumeric: (value: any) => value is Numeric;
export default isNumeric;
