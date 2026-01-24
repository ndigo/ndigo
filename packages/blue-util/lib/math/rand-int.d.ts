/**
 * @author Jeff Rose
 */
/**
 * Generates a pseudo-random integer between `min` and `max`.
 * @function module:util.randInt
 * @category Math
 * @param {external:number} [min=Number.MIN_SAFE_INTEGER]
 * @param {external:number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {external:number} A pseudo-random integer between `min` and `max`.
 * @example
 * randInt( 0, 10 );
 * //=> 7
 * randInt( 0, 10 );
 * //=> 6
 */
declare const randInt: (min?: number, max?: number) => number;
export default randInt;
//# sourceMappingURL=rand-int.d.ts.map