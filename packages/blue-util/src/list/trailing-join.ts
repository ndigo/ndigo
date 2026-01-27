/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { append, curry, join } from 'ramda';

type TrailingJoinFunction = {
    (separator: string, list: any[]): string;
    (separator: string): (list: any[]) => string;
};

/**
 * Returns a string made by inserting the separator after each element and concatenating all the elements into a single string.
 * @category List
 * @param {string} separator The string that will be placed between list items.
 * @param {Array} list The list to be joined.
 * @returns {string} The concatenated list.
 * @example
 * const trailingJoinOnColon = trailingJoin( ":" );
 * trailingJoinOnColon( [ "a", "b", "c" ] );
 * //=> "a:b:c:"
 * trailingJoin( ",", [ "a", "b", "c" ] );
 * //=> "a,b,c,"
 */
const trailingJoin: TrailingJoinFunction = curry((separator: string, list: any[]): string =>
    join(separator, append('', list))
);

export default trailingJoin;
