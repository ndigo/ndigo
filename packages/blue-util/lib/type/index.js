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
 * Checks if a value is an instance of a particular type.
 * @category Type
 * @param {*} ctor A constructor
 * @param {*} val The value to test
 * @returns {boolean}
 */
export { is };
/**
 * Checks if the input value is null or undefined.
 * @category Type
 * @param {*} x The value to test
 * @returns {boolean}
 */
export { isNil };
/**
 * Checks if the input value is not null or undefined.
 * @category Type
 * @param {*} x The value to test
 * @returns {boolean}
 */
export { isNotNil };
/**
 * Returns true if the specified object property is of the given type; false otherwise.
 * @category Type
 * @param {Function} type A constructor
 * @param {string} name Property name
 * @param {*} obj Object to test
 * @returns {boolean}
 */
export { propIs };
/**
 * Gives a single-word string description of the (native) type of a value.
 * @category Type
 * @param {*} val The value to test
 * @returns {string}
 */
export { type };
// Export custom functions
export { isConstructor, isFunction, isNumber, isNumeric, isString, isValidDate, like, likeArray, likePromise };
// Default export: namespace object
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCw0Q0FBNEM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFMUQsd0NBQXdDO0FBQ3hDLE9BQU8sYUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBQ2hELE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sU0FBUyxNQUFNLGlCQUFpQixDQUFDO0FBQ3hDLE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUM3QixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4QyxPQUFPLFdBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1Qzs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFZDs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUVqQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUVwQjs7Ozs7OztHQU9HO0FBQ0gsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRWxCOzs7OztHQUtHO0FBQ0gsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBRWhCLDBCQUEwQjtBQUMxQixPQUFPLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUUvRyxtQ0FBbUM7QUFDbkMsZUFBZTtJQUNYLEVBQUU7SUFDRixhQUFhO0lBQ2IsVUFBVTtJQUNWLEtBQUs7SUFDTCxRQUFRO0lBQ1IsUUFBUTtJQUNSLFNBQVM7SUFDVCxRQUFRO0lBQ1IsV0FBVztJQUNYLElBQUk7SUFDSixTQUFTO0lBQ1QsV0FBVztJQUNYLE1BQU07SUFDTixJQUFJO0NBQ1AsQ0FBQyJ9