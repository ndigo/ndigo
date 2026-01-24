/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { append, curry, join } from 'ramda';

/**
 * Returns a string made by inserting the separator after each element and concatenating all the elements into a single string.
 * @function module:util.trailingJoin
 * @category List
 * @param {external:string} separator The string that will be placed between list items.
 * @param {external:Array} list The list to be joined.
 * @returns {external:string} The concatenated list.
 * @example
 * const trailingJoinOnColon = trailingJoin( ":" );
 * trailingJoinOnColon( [ "a", "b", "c" ] );
 * //=> "a:b:c:"
 * trailingJoin( ",", [ "a", "b", "c" ] );
 * //=> "a,b,c,"
 */
const trailingJoin = curry((separator: string, list: any[]): string => join(separator, append('', list)));

export default trailingJoin;
