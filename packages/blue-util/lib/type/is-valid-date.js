/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://date-fns.org/}
 */
import isNumber from './is-number.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtdmFsaWQtZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2lzLXZhbGlkLWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDOUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV0QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUF3QyxFQUMxRCxjQUFjLEdBQUcsTUFBTSxDQUFNLE1BQU0sRUFBRSxRQUFRLENBQUM7QUFDOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQTZCLENBQUM7QUFFakYsZUFBZSxXQUFXLENBQUMifQ==