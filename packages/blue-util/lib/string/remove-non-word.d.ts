/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonWord}
 */
/**
 * Parses a piped list string into an object.
 * @function module:util.removeNonWord
 * @param {external:string} value The string to be transformed.
 * @returns {external:string} The `value` with the non-word characters removed.
 * @category String
 * @example
 * removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
 * //=> "lorem - ipsum"
 */
declare const removeNonWord: (value: string) => string;
export default removeNonWord;
//# sourceMappingURL=remove-non-word.d.ts.map