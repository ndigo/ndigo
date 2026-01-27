/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
type SampleFunction = {
    <T = any>(n: number, list: ArrayLike<T>): T[];
    <T = any>(n: number): (list: ArrayLike<T>) => T[];
};
/**
 * @category List
 * @param {number} n The number of values to be sampled.
 * @param {ArrayLike} list The list from which values will be sampled.
 * @returns {Array} The sampled value(s).
 * @example
 * let list = [ "a", "b", "c" ];
 * sample( 2, list );
 * //=> [ "c", "a" ]
 * const sampleOne = sample( 1 );
 * sampleOne( list );
 * //=> [ "b" ]
 */
declare const sample: SampleFunction;
export default sample;
//# sourceMappingURL=sample.d.ts.map