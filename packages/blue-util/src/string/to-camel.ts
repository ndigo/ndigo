/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#camelCase}
 */

import { pipe, replace, toLower, toUpper } from 'ramda';

import removeNonWord from './remove-non-word';
import replaceDiacritics from './replace-diacritics';

const // Underscores and hyphens
    dashes = /[\-_]/g,
    // Lower case letters preceded by a space
    lowerCaseLetters = /\s[a-z]/g,
    // Spaces
    spaces = /\s+/g,
    // Upper case letters at the beginning of a string
    upperCaseLetters = /^[A-Z]/g,
    // Remove spaces
    removeSpaces = replace(spaces, ''),
    // Convert hyphens and underscores to spaces
    replaceDashesWithSpaces = replace(dashes, ' '),
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
    toCamel: (value: string) => string = pipe(
        replaceDiacritics,
        removeNonWord,
        replaceDashesWithSpaces,
        // Convert first character of each word to uppercase
        (val: string): string => val.replace(lowerCaseLetters, toUpper),
        removeSpaces,
        // Convert first character to lowercase
        (val: string): string => val.replace(upperCaseLetters, toLower)
    );

export default toCamel;
