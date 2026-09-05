/**
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#sentenceCase}
 */

const regex = /(^\w)|\.\s+(\w)/gm;

/**
 * Returns the sentence case version of a string.
 * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toSentence( 'lorem-ipsum-dolor' );
 * //=> "Lorem ipsum dolor"
 */
const toSentence = (value: string): string =>
    value.toLowerCase().replace(regex, (c: string): string => c.toUpperCase());

export default toSentence;
