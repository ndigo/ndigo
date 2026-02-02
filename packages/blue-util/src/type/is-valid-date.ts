/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://date-fns.org/}
 */

import isNumber from './is-number.js';
import { either, F, ifElse, is } from 'ramda';
import { isValid } from 'date-fns/fp';

const isDate = is(Date) as unknown as (value) => value is Date,
    // @ts-expect-error - either is typed as any in our ramda.d.ts
    isPossibleDate = either<any>(isDate, isNumber),
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
    isValidDate = ifElse(isPossibleDate, isValid, F) as (value) => value is Date;

export default isValidDate;
