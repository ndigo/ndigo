/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import removeNonWord from './remove-non-word.js';
import replaceDiacritics from './replace-diacritics.js';

const // Underscores and hyphens
    dashes = /[-_]/g,
    // Lower case letters preceded by a space
    lowerCaseLetters = /\s[a-z]/g,
    // Spaces
    spaces = /\s+/g,
    // Upper case letters at the beginning of a string
    upperCaseLetters = /^[A-Z]/g,
    // Remove spaces
    removeSpaces = (val: string) => val.replace(spaces, ''),
    // Convert hyphens and underscores to spaces
    replaceDashesWithSpaces = (val: string) => val.replace(dashes, ' '),
    /**
     * Returns the camel case version of a string.
     * @param {string} value
     * @returns {string}
     * @category String
     * @example
     * toCamel( 'lorem-ipsum-dolor' );
     * //=> "loremIpsumDolor"
     * @see {@link http://wiki.c2.com/?CamelCase}
     */
    toCamel: (value: string) => string = (val: string): string => {
        val = replaceDiacritics(val);
        val = removeNonWord(val);
        val = replaceDashesWithSpaces(val);
        // Convert first character of each word to uppercase
        val = val.replace(lowerCaseLetters, (match: string): string => match.toUpperCase());
        val = removeSpaces(val);
        // Convert first character to lowercase
        val = val.replace(upperCaseLetters, (match: string): string => match.toLowerCase());
        return val;
    };

export default toCamel;
