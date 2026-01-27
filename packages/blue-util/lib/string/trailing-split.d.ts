/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
type TrailingSplitFunction = {
    (separator: string, text: string): string[];
    (separator: string): (text: string) => string[];
};
/**
 * Splits a string into an array of strings based on the given separator.
 * @param {string} separator
 * @param {string} text
 * @returns {Array<external:string>}
 * @category String
 * @example
 * const trailingSplitOnPipe = trailingSplit( "|" );
 * trailingSplitOnPipe( "a|b|c|" );
 * //=> [ "a", "b", "c" ]
 * trailingSplit( ",", "a,b,c," );
 * //=> [ "a", "b", "c" ]
 */
declare const trailingSplit: TrailingSplitFunction;
export default trailingSplit;
//# sourceMappingURL=trailing-split.d.ts.map