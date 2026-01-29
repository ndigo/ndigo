/**
 * @author Jeff Rose
 * @module math
 */
import { add, dec, divide, inc, mathMod, mean, median, modulo, multiply, negate, product, subtract, sum } from 'ramda';
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
export { guid, rand, randHex, randInt, random };
declare const _default: {
    add: typeof add;
    dec: typeof dec;
    divide: typeof divide;
    guid: () => string;
    inc: typeof inc;
    mathMod: typeof mathMod;
    mean: typeof mean;
    median: typeof median;
    modulo: typeof modulo;
    multiply: typeof multiply;
    negate: typeof negate;
    product: typeof product;
    rand: (min?: number, max?: number) => number;
    randHex: (size?: number) => string;
    randInt: (min?: number, max?: number) => number;
    random: () => number;
    subtract: typeof subtract;
    sum: typeof sum;
};
export default _default;
//# sourceMappingURL=index.d.ts.map