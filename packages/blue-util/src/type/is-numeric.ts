/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import isNumber from './is-number.js';
import isString from './is-string.js';

export type Numeric = number | `${number}`;

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
const isNumeric = (value: unknown): value is Numeric => {
    if (isNumber(value)) return true;

    if (isString(value)) {
        const trimmed = String(value).trim();
        return trimmed !== '' && isNumber(+trimmed);
    }

    return false;
};

export default isNumeric;
