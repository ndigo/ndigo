/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { curryN, slice, split, trim } from 'ramda';

/**
 * Splits a string into an array of strings based on the given separator.
 * @function module:util.trailingSplit
 * @param {external:string} separator
 * @param {external:string} text
 * @returns {external:Array<external:string>}
 * @category String
 * @example
 * const trailingSplitOnPipe = trailingSplit( "|" );
 * trailingSplitOnPipe( "a|b|c|" );
 * //=> [ "a", "b", "c" ]
 * trailingSplit( ",", "a,b,c," );
 * //=> [ "a", "b", "c" ]
 */
const trailingSplit = curryN(2, (separator: string, text: string): string[] => {
    text = trim(text);

    const length = text.length;

    if (length && text.indexOf(separator) !== -1) {
        const tail = length - 1,
            isSeparatorTrailing = text[tail] === separator,
            isEmptyString = isSeparatorTrailing && text[length - 2] === separator;
        return split(separator, isSeparatorTrailing && !isEmptyString ? slice(0, tail, text) : text);
    }

    return [text];
});

export default trailingSplit;
