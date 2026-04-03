/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { append, join } from 'ramda';

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
function trailingJoin(separator: string, list: any[]): string;
function trailingJoin(separator: string): (list: any[]) => string;
function trailingJoin(separator: string, list?: any[]): string | ((list: any[]) => string) {
    const impl = (l: any[]): string => join(separator, append('', l));
    if (arguments.length >= 2) {
        return impl(list!);
    }
    return impl;
}

export { trailingJoin };
