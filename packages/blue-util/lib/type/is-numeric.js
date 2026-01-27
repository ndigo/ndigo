/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { both, complement, cond, isEmpty, pipe, F, T, trim } from 'ramda';
import isNumber from './is-number';
import isString from './is-string';
const isNotEmptyString = both(isString, pipe(trim, complement(isEmpty))), 
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
isNumeric = cond([
    [isNumber, T],
    [isNotEmptyString, (value) => isNumber(+value)],
    [T, F],
]);
export default isNumeric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtbnVtZXJpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2lzLW51bWVyaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDMUUsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUluQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNwRTs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxTQUFTLEdBQUcsSUFBSSxDQUFlO0lBQzNCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNiLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNULENBQWdDLENBQUM7QUFFdEMsZUFBZSxTQUFTLENBQUMifQ==