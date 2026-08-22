/**
 * @author Jeff Rose
 * @see {@link https://github.com/janl/mustache.js/blob/master/mustache.js#L73}
 */
declare const decodeHTML: (value: string) => string;
/**
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @example
 * decodeHTML( '&lt;div&gt;' );
 * //=> "<div>"
 * @category String
 */
export default decodeHTML;
