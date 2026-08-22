/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonASCII}
 */
/**
 * Remove non-printable characters
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-printable characters removed.
 * @example
 * removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
 * //=> "lorem-ipsum"
 * @category String
 */
declare const removeNonPrintable: (value: string) => string;
export default removeNonPrintable;
