/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import rand from './rand.js';

/**
 * Generates a pseudo-random integer between `min` and `max`.
 * @category Math
 * @param {number} [min=Number.MIN_SAFE_INTEGER]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number} A pseudo-random integer between `min` and `max`.
 * @example
 * randInt( 0, 10 );
 * //=> 7
 * randInt( 0, 10 );
 * //=> 6
 */
const randInt = (min?: number, max?: number): number => {
    min = typeof min !== 'number' ? Number.MIN_SAFE_INTEGER : ~~min;
    max = typeof max !== 'number' ? Number.MAX_SAFE_INTEGER : ~~max;
    // can't be max + 0.5 otherwise it will round up if `rand`
    // returns `max` causing it to overflow range.
    // -0.5 and + 0.49 are required to avoid bias caused by rounding
    return Math.round(rand(min - 0.5, max + 0.499999999999));
};

export default randInt;
