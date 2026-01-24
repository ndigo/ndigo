/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { both, complement, cond, isEmpty, pipe, F, T, trim } from 'ramda';
import isNumber from './is-number';
import isString from './is-string';

export type Numeric = number | `${ number }`;

const
    isNotEmptyString = both( isString, pipe( trim, complement( isEmpty ) ) ),

    /**
     * Determines whether a given value is numeric, i.e. a number or a string containing a number. The {@linkcode module:util.isNumber|isNumber} method determines whether the value, parsed or not, is a number.
     * @function module:util.isNumeric
     * @category Type
     * @param {*} value The value to be tested.
     * @returns {external:boolean} Whether or not `value` is numeric.
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
     * @see {@link module:util.isNumber}
     */
    isNumeric = cond<any, boolean>( [
        [ isNumber, T ],
        [ isNotEmptyString, ( value ) => isNumber( +value ) ],
        [ T, F ]
    ] ) as ( value ) => value is Numeric;

export default isNumeric;
