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
