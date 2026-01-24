/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonASCII}
 */
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
declare const removeNonPrintable: (value: string) => string;
export default removeNonPrintable;
//# sourceMappingURL=remove-non-printable.d.ts.map