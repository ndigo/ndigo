/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * Determines whether a given object is a function.
 * @function module:util.isFunction
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is a function.
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
declare const isFunction: (value: any) => value is Function;
export default isFunction;
//# sourceMappingURL=is-function.d.ts.map