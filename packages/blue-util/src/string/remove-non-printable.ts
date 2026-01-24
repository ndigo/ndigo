/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonASCII}
 */

import { replace } from 'ramda';

// Matches non-printable ASCII chars -
// http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
const nonPrintable = /[^\x20-\x7E]/g;

/**
 * Remove non-printable characters
 * @function module:util.removeNonPrintable
 * @param {external:string} value The string to be transformed.
 * @returns {external:string} The `value` with the non-printable characters removed.
 * @example
 * removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
 * //=> "lorem-ipsum"
 * @category String
 */
const removeNonPrintable: (value: string) => string = replace(nonPrintable, '');

export default removeNonPrintable;
