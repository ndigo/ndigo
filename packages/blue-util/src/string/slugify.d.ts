/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#slugify}
 * @see {@link https://github.com/dodo/node-slug}
 */
/**
 * Converts a string into a slug.
 * @category String
 * @param {string} delimiter The character with which spaces will be replaced.
 * @param {string} value The value to be slugified.
 * @returns {string} The slugified string.
 * @example
 * slugify( '-', 'Lorem Ipsum Dolor' );
 * //=> "lorem-ipsum-dolor"
 * slugify( '~', 'Lorem Ipsum Dolor' );
 * //=> "lorem~ipsum~dolor"
 */
declare const slugify: (delimiter: string, value: string) => string;
export default slugify;
