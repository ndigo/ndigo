/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://date-fns.org/}
 */
import isNumber from './is-number';
import { either, F, ifElse, is } from 'ramda';
import { isValid } from 'date-fns/fp';
const isDate = is(Date), isPossibleDate = either(isDate, isNumber), 
/**
 * Determines whether a given value is a valid date.
 * @category Type
 * @summary Is the given value a valid date?
 *
 * @description
 * Returns false if argument is and invalid date and true otherwise.
 * Invalid Date is a Date, whose time value is NaN.
 * @param {Date|external:Number} date The date to validate
 * @returns {boolean} the date is valid
 * @throws {TypeError} 1 argument required
 * @example
 * // For the valid date:
 * var result = isValidDate( new Date( 2014, 1, 31 ) )
 * //=> true
 * @example
 * // For the value, convertable into a date:
 * var result = isValidDate( 1393804800000 )
 * //=> true
 * @example
 * // For the invalid date:
 * var result = isValidDate( new Date( '' ) )
 * //=> false
 * @see {@link http://es5.github.io/#x15.9.1.1}
 */
isValidDate = ifElse(isPossibleDate, isValid, F);
export default isValidDate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtdmFsaWQtZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2lzLXZhbGlkLWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzlDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFdEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBd0MsRUFDMUQsY0FBYyxHQUFHLE1BQU0sQ0FBTSxNQUFNLEVBQUUsUUFBUSxDQUFDO0FBQzlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUE2QixDQUFDO0FBRWpGLGVBQWUsV0FBVyxDQUFDIn0=