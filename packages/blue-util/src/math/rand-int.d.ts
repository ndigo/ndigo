/**
 * @author Jeff Rose
 */
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
declare const randInt: (min?: number, max?: number) => number;
export default randInt;
