/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
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
const isFunction = (value: unknown): value is Function => typeof value === 'function';

export default isFunction;
