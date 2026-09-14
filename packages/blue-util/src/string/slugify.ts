/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import removeNonWord from './remove-non-word.js';
import slug from 'slug';

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
const slugify = (delimiter: string, value: string): string => {
    const cleanValue = removeNonWord(value);
    const result = slug(cleanValue, { remove: null, replacement: delimiter, lower: false });
    return result.toLowerCase();
};
export default slugify;
