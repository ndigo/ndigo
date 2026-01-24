/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
type RangeNFunction = {
    (step: number, from: number, to?: number): number[];
    (step: number): (from: number, to?: number) => number[];
    (step: number, from: number): (to?: number) => number[];
};
declare const 
/**
 * @function module:util.rangeN
 * @category List
 * @param {external:number} step The amount by which the first number will be incremented or decremented.
 * @param {external:number} from The first number in the list.
 * @param {external:number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @return {external:Array} The list of numbers in the set `[a, b)` adjusted by the step amount.
 * @example
 * rangeN( 2, 0, 5 );
 * //=> [ 0, 2, 4 ]
 *
 * const rangeThree = rangeN( 3 );
 * rangeThree( 2, 10 );
 * //=> [ 2, 5, 8 ]
 * @see {@link module:util.range}
 */
rangeN: RangeNFunction;
export default rangeN;
//# sourceMappingURL=range-n.d.ts.map