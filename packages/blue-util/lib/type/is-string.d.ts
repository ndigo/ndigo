/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
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
declare const isString: (value: any) => value is string;
export default isString;
//# sourceMappingURL=is-string.d.ts.map