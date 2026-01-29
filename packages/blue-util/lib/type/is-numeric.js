/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { both, complement, cond, isEmpty, pipe, F, T, trim } from 'ramda';
import isNumber from './is-number.js';
import isString from './is-string.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtbnVtZXJpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2lzLW51bWVyaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDMUUsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFJdEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDcEU7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsU0FBUyxHQUFHLElBQUksQ0FBZTtJQUMzQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDYixDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDVCxDQUFnQyxDQUFDO0FBRXRDLGVBQWUsU0FBUyxDQUFDIn0=