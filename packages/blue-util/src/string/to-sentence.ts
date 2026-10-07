/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
const regex = /(^\w)|\.\s+(\w)/gm;

/**
 * Returns the sentence case version of a string.
 * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toSentence( 'lorem ipsum. dolor sit' );
 * //=> "Lorem ipsum. Dolor sit"
 */
const toSentence = (value: string): string =>
    value.toLowerCase().replace(regex, (c: string): string => c.toUpperCase());

export default toSentence;
