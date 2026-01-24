/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { is } from 'ramda';
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
const isFunction = is(Function);
export default isFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZS9pcy1mdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTNCOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQWlDLENBQUM7QUFFaEUsZUFBZSxVQUFVLENBQUMifQ==