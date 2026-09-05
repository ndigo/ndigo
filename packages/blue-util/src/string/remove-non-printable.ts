/**
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonASCII}
 */

// Matches non-printable ASCII chars -
// http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
const nonPrintable = /[^\x20-\x7E]/g;

/**
 * Remove non-printable characters
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-printable characters removed.
 * @example
 * removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
 * //=> "lorem-ipsum"
 * @category String
 */
const removeNonPrintable: (value: string) => string = (val: string) => val.replace(nonPrintable, '');

export default removeNonPrintable;
