/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
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
const removeNonWord: (value: string) => string = (val: string) =>
    val.replace(/[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g, '');

export default removeNonWord;
