/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#properCase}
 */
/**
 * Returns the proper case version of a string.
 * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toProper( 'lorem-ipsum-dolor' );
 * //=> "Lorem Ipsum Dolor"
 */
declare const toProper: (value: string) => string;
export default toProper;
