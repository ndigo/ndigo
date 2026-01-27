/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#slugify}
 * @see {@link https://github.com/dodo/node-slug}
 */
type SlugifyFunction = {
    (delimiter: string, value: string): string;
    (delimiter: string): (value: string) => string;
};
/**
 * Converts a string into a slug.
 * @category String
 * @param {string} delimiter The character with which spaces will be replaced.
 * @param {string} value The value to be slugified.
 * @returns {string} The slugified string.
 * @example
 * const hyphenate = slugify( '-' );
 * hyphenate( 'Lorem Ipsum Dolor' );
 * //=> "lorem-ipsum-dolor"
 * slugify( '~', 'Lorem Ipsum Dolor' );
 * //=> "lorem~ipsum~dolor"
 */
declare const slugify: SlugifyFunction;
export default slugify;
//# sourceMappingURL=slugify.d.ts.map