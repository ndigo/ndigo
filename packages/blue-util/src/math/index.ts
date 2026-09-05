/**
 * @author Jeff Rose
 * @module math
 */

// Import custom functions for re-export
import guid from './guid.js';
import rand from './rand.js';
import randHex from './rand-hex.js';
import randInt from './rand-int.js';
import random from './random.js';

/**
 * Adds two values.
 *
 * @category Math
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @see {@link subtract|subtract}
 * @example
 * add( 2, 3 );
 * //=>  5
 * add( 7 )( 10 );
 * //=> 17
 */
export const add = (a: number, b: number): number => a + b;

/**
 * Decrements its argument.
 *
 * @category Math
 * @param {number} n
 * @returns {number} n - 1
 * @see {@link inc|inc}
 * @example
 * dec( 42 ); //=> 41
 */
export const dec = (n: number): number => n - 1;

/**
 * Divides two numbers. Equivalent to `a / b`.
 *
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number} The result of `a / b`.
 * @see {@link multiply|multiply}
 * @example
 * import { __, divide } from '@blue/util';
 * divide( 71, 100 ); //=> 0.71
 *
 * const half = divide( __, 2 );
 * half( 42 ); //=> 21
 *
 * const reciprocal = divide( 1 );
 * reciprocal( 4 );   //=> 0.25
 */
export const divide = (a: number, b: number): number => a / b;

/**
 * Increments its argument.
 *
 * @category Math
 * @param {number} n
 * @returns {number} n + 1
 * @see {@link dec|dec}
 * @example
 * inc( 42 ); //=> 43
 */
export const inc = (n: number): number => n + 1;

/**
 * `mathMod` behaves like the modulo operator should mathematically, unlike the
 * `%` operator (and by extension, [`R.modulo`](#modulo)). So while
 * `-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
 * arguments, and returns NaN when the modulus is zero or negative.
 *
 * @category Math
 * @param {number} m The dividend.
 * @param {number} p the modulus.
 * @returns {number} The result of `b mod a`.
 * @see {@link modulo|modulo}
 * @example
 * import { __, mathMod } from '@blue/util';
 * mathMod( -17, 5 );  //=> 3
 * mathMod( 17, 5 );   //=> 2
 * mathMod( 17, -5 );  //=> NaN
 * mathMod( 17, 0 );   //=> NaN
 * mathMod( 17.2, 5 ); //=> NaN
 * mathMod( 17, 5.3 ); //=> NaN
 *
 * const clock = mathMod( __, 12 );
 * clock( 15 ); //=> 3
 * clock( 24 ); //=> 0
 *
 * const seventeenMod = mathMod( 17 );
 * seventeenMod( 3 );  //=> 2
 * seventeenMod( 4 );  //=> 1
 * seventeenMod( 10 ); //=> 7
 */
export const mathMod = (m: number, p: number): number => {
    if (!Number.isInteger(m) || !Number.isInteger(p) || p <= 0) return NaN;
    return ((m % p) + p) % p;
};

/**
 * Returns the mean of the given list of numbers.
 *
 * @category Math
 * @param {Array} list
 * @returns {number}
 * @see {@link median|median}
 * @example
 * mean( [ 2, 7, 9 ] ); //=> 6
 * mean( [] ); //=> NaN
 */
export const mean = (list: number[]): number => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : NaN);

/**
 * Returns the median of the given list of numbers.
 *
 * @category Math
 * @param {Array} list
 * @returns {number}
 * @see {@link mean|mean}
 * @example
 * median( [ 2, 9, 7 ] ); //=> 7
 * median( [ 7, 2, 10, 9 ] ); //=> 8
 * median( [] ); //=> NaN
 */
export const median = (list: number[]): number => {
    if (!list.length) return NaN;
    const sorted = [...list].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Divides the first parameter by the second and returns the remainder. Note
 * that this function preserves the JavaScript-style behavior for modulo. For
 * mathematical modulo see [`mathMod`](#mathMod).
 *
 * @category Math
 * @param {number} a The value to the divide.
 * @param {number} b The pseudo-modulus
 * @returns {number} The result of `b % a`.
 * @see {@link mathMod|mathMod}
 * @example
 * import { __, modulo } from '@blue/util';
 * modulo( 17, 3 );
 * //=> 2
 * // JS behavior:
 * modulo( -17, 3 );
 * //=> -2
 * modulo( 17, -3 );
 * //=> 2
 *
 * const isOdd = modulo( __, 2 );
 * isOdd( 42 );
 * //=> 0
 * isOdd( 21 );
 * //=> 1
 */
export const modulo = (a: number, b: number): number => a % b;

/**
 * Multiplies two numbers. Equivalent to `a * b` but curried.
 *
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number} The result of `a * b`.
 * @see {@link divide|divide}
 * @example
 * const double = multiply( 2 );
 * const triple = multiply( 3 );
 * double( 3 );
 * //=>  6
 * triple( 4 );
 * //=> 12
 * multiply( 2, 5 );
 * //=> 10
 */
export const multiply = (a: number, b: number): number => a * b;

/**
 * Negates its argument.
 *
 * @category Math
 * @param {number} n
 * @returns {number}
 * @example
 * negate( 42 );
 * //=> -42
 */
export const negate = (n: number): number => -n;

/**
 * Multiplies together all the elements of a list.
 *
 * @category Math
 * @param {Array} list An array of numbers
 * @returns {number} The product of all the numbers in the list.
 * @see `reduce`
 * @example
 * product( [ 2, 4, 6, 8, 100, 1 ] );
 * //=> 38400
 */
export const product = (list: number[]): number => list.reduce((a, b) => a * b, 1);

/**
 * Subtracts its second argument from its first argument.
 *
 * @category Math
 * @param {number} a The first value.
 * @param {number} b The second value.
 * @returns {number} The result of `a - b`.
 * @see {@link add|add}
 * @example
 * import { __, subtract } from '@blue/util';
 * subtract( 10, 8 );
 * //=> 2
 *
 * const minus5 = subtract( __, 5 );
 * minus5( 17 );
 * //=> 12
 *
 * const complementaryAngle = subtract( 90 );
 * complementaryAngle( 30 );
 * //=> 60
 * complementaryAngle( 72 );
 * //=> 18
 */
export const subtract = (a: number, b: number): number => a - b;

/**
 * Adds together all the elements of a list.
 *
 * @category Math
 * @param {Array} list An array of numbers
 * @returns {number} The sum of all the numbers in the list.
 * @see `reduce`
 * @example
 * sum( [ 2, 4, 6, 8, 100, 1 ] );
 * //=> 121
 */
export const sum = (list: number[]): number => list.reduce((a, b) => a + b, 0);

// Export custom functions
export { guid, rand, randHex, randInt, random };

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
