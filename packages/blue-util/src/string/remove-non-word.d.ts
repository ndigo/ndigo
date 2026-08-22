/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonWord}
 */
/**
 * Remove non-word characters.
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-word characters removed.
 * @category String
 * @example
 * removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
 * //=> "lorem _- ipsum"
 */
declare const removeNonWord: (value: string) => string;
export default removeNonWord;
