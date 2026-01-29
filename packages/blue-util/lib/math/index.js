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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWF0aC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCw0Q0FBNEM7QUFDNUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUV2SCx3Q0FBd0M7QUFDeEMsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBQzdCLE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUM3QixPQUFPLE9BQU8sTUFBTSxlQUFlLENBQUM7QUFDcEMsT0FBTyxPQUFPLE1BQU0sZUFBZSxDQUFDO0FBQ3BDLE9BQU8sTUFBTSxNQUFNLGFBQWEsQ0FBQztBQUVqQzs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFFZjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUVmOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUVsQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUVmOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUVuQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUVoQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUVsQjs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFFbEI7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBRXBCOzs7OztHQUtHO0FBQ0gsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRWxCOzs7OztHQUtHO0FBQ0gsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBRW5COzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUVwQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUVmLDBCQUEwQjtBQUMxQixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRWhELG1DQUFtQztBQUNuQyxlQUFlO0lBQ1gsR0FBRztJQUNILEdBQUc7SUFDSCxNQUFNO0lBQ04sSUFBSTtJQUNKLEdBQUc7SUFDSCxPQUFPO0lBQ1AsSUFBSTtJQUNKLE1BQU07SUFDTixNQUFNO0lBQ04sUUFBUTtJQUNSLE1BQU07SUFDTixPQUFPO0lBQ1AsSUFBSTtJQUNKLE9BQU87SUFDUCxPQUFPO0lBQ1AsTUFBTTtJQUNOLFFBQVE7SUFDUixHQUFHO0NBQ04sQ0FBQyJ9