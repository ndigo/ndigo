/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.
 * @function module:util.isNumber
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is a number.
 * @example
 * typeof new Number( 1 ) === 'number';
 * //=> false
 * isNumber( new Number( 1 ) );
 * //=> true
 * typeof 2 === 'number';
 * //=> true
 * isNumber( 2 );
 * //=> true
 * typeof NaN === 'number';
 * //=> true
 * isNumber( NaN );
 * //=> false
 * typeof Infinity === 'number';
 * //=> true
 * isNumber( Infinity );
 * //=> false
 */
declare const isNumber: (value: any) => value is number;
export default isNumber;
//# sourceMappingURL=is-number.d.ts.map