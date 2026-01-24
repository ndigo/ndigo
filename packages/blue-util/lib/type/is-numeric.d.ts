/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
export type Numeric = number | `${number}`;
declare const 
/**
 * Determines whether a given value is numeric, i.e. a number or a string containing a number. The {@linkcode module:util.isNumber|isNumber} method determines whether the value, parsed or not, is a number.
 * @function module:util.isNumeric
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is numeric.
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
 * @see {@link module:util.isNumber}
 */
isNumeric: (value: any) => value is Numeric;
export default isNumeric;
//# sourceMappingURL=is-numeric.d.ts.map