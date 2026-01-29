/**
 * @author Jeff Rose
 * @module math
 */

// Import Ramda Math functions for re-export
import { add, dec, divide, inc, mathMod, mean, median, modulo, multiply, negate, product, subtract, sum } from 'ramda';

// Import custom functions for re-export
import guid from './guid.js';
import rand from './rand.js';
import randHex from './rand-hex.js';
import randInt from './rand-int.js';
import random from './random.js';

/**
 * Adds two values.
 * @category Math
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export { add };

/**
 * Decrements its argument.
 * @category Math
 * @param {number} n
 * @returns {number}
 */
export { dec };

/**
 * Divides two numbers. Equivalent to `a / b`.
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number}
 */
export { divide };

/**
 * Increments its argument.
 * @category Math
 * @param {number} n
 * @returns {number}
 */
export { inc };

/**
 * Divides the first parameter by the second and returns the remainder.
 * @category Math
 * @param {number} a The value to the get the modulus of.
 * @param {number} b An integer.
 * @returns {number}
 */
export { mathMod };

/**
 * Returns the mean of the given list of numbers.
 * @category Math
 * @param {Array} list
 * @returns {number}
 */
export { mean };

/**
 * Returns the median of the given list of numbers.
 * @category Math
 * @param {Array} list
 * @returns {number}
 */
export { median };

/**
 * Divides the first parameter by the second and returns the remainder.
 * @category Math
 * @param {number} a The value to the get the modulus of.
 * @param {number} b An integer.
 * @returns {number}
 */
export { modulo };

/**
 * Multiplies two numbers. Equivalent to `a * b`.
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number}
 */
export { multiply };

/**
 * Negates its argument.
 * @category Math
 * @param {number} n
 * @returns {number}
 */
export { negate };

/**
 * Multiplies together all the elements of a list.
 * @category Math
 * @param {Array} list An array of numbers
 * @returns {number}
 */
export { product };

/**
 * Subtracts its second argument from its first argument.
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number}
 */
export { subtract };

/**
 * Adds together all the elements of a list.
 * @category Math
 * @param {Array} list An array of numbers
 * @returns {number}
 */
export { sum };

// Export custom functions
export { guid, rand, randHex, randInt, random };

// Default export: namespace object
export default {
    add,
    dec,
    divide,
    guid,
    inc,
    mathMod,
    mean,
    median,
    modulo,
    multiply,
    negate,
    product,
    rand,
    randHex,
    randInt,
    random,
    subtract,
    sum,
};
