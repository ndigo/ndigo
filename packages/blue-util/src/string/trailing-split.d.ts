/**
 * @author Jeff Rose
 */
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
declare function trailingSplit(separator: string, text: string): string[];
declare function trailingSplit(separator: string): (text: string) => string[];
export default trailingSplit;
