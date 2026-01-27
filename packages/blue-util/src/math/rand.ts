/**
 * @author Jeff Rose
 */

import random from './random';

/**
 * Generates a pseudo-random number between `min` and `max`.
 * @category Math
 * @param {number} [min=Number.MIN_SAFE_INTEGER]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number} A pseudo-random number between `min` and `max`.
 * @example
 * rand( 0, 10 );
 * //=> 7.369723
 * rand( 0, 10 );
 * //=> 5.987042
 */
const rand = (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => min + (max - min) * random();

export default rand;
