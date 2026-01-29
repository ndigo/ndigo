/**
 * @author Jeff Rose
 * @module type
 */
// Import Ramda Type functions for re-export
import { is, isNil, isNotNil, propIs, type } from 'ramda';
// Import custom functions for re-export
import isConstructor from './is-constructor.js';
import isFunction from './is-function.js';
import isNumber from './is-number.js';
import isNumeric from './is-numeric.js';
import isString from './is-string.js';
import isValidDate from './is-valid-date.js';
import like from './like.js';
import likeArray from './like-array.js';
import likePromise from './like-promise.js';
/**
 * See if an object (`val`) is an instance of the supplied constructor. This
 * function will check up the inheritance chain, if any.
 *
 * @category Type
 * @param {Object} ctor A constructor
 * @param {*} val The value to test
 * @returns {boolean}
 * @example
 * is( Object, {} ); //=> true
 * is( Number, 1 ); //=> true
 * is( Object, 1 ); //=> false
 * is( String, 's' ); //=> true
 * is( String, new String('') ); //=> true
 * is( Object, new String('') ); //=> true
 * is( Object, 's' ); //=> false
 * is( Number, {} ); //=> false
 */
export { is };
/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @category Type
 * @param {*} x The value to test.
 * @returns {boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 * isNil( null ); //=> true
 * isNil( undefined ); //=> true
 * isNil( 0 ); //=> false
 * isNil( [] ); //=> false
 */
export { isNil };
/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @category Type
 * @param {*} val The value to test
 * @returns {string}
 * @example
 * type( {} ); //=> "Object"
 * type( 1 ); //=> "Number"
 * type( false ); //=> "Boolean"
 * type( 's' ); //=> "String"
 * type( null ); //=> "Null"
 * type( [] ); //=> "Array"
 * type( /[A-z]/ ); //=> "RegExp"
 * type( () => {} ); //=> "Function"
 * type( undefined ); //=> "Undefined"
 */
export { type };
// Export custom functions
export { isConstructor, isFunction, isNumber, isNumeric, isString, isValidDate, like, likeArray, likePromise };
export default {
    is,
    isConstructor,
    isFunction,
    isNil,
    isNotNil,
    isNumber,
    isNumeric,
    isString,
    isValidDate,
    like,
    likeArray,
    likePromise,
    propIs,
    type,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCw0Q0FBNEM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFMUQsd0NBQXdDO0FBQ3hDLE9BQU8sYUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBQ2hELE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sU0FBUyxNQUFNLGlCQUFpQixDQUFDO0FBQ3hDLE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUM3QixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4QyxPQUFPLFdBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFZDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUVqQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUVoQiwwQkFBMEI7QUFDMUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFFL0csZUFBZTtJQUNYLEVBQUU7SUFDRixhQUFhO0lBQ2IsVUFBVTtJQUNWLEtBQUs7SUFDTCxRQUFRO0lBQ1IsUUFBUTtJQUNSLFNBQVM7SUFDVCxRQUFRO0lBQ1IsV0FBVztJQUNYLElBQUk7SUFDSixTQUFTO0lBQ1QsV0FBVztJQUNYLE1BQU07SUFDTixJQUFJO0NBQ1AsQ0FBQyJ9