/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#pascalCase}
 */

import toCamel from './to-camel.js';

const // Lower case letters at the beginning of a string
    lowerCaseLetters = /^[a-z]/,
    /**
     * Returns the pascal case version of a string.
     * @param {string} value
     * @returns {string}
     * @category String
     * @example
     * toPascal( 'lorem-ipsum-dolor' );
     * //=> "LoremIpsumDolor"
     * @see {@link http://wiki.c2.com/?PascalCase}
     */
    toPascal: (value: string) => string = (val: string): string => {
        val = toCamel(val);
        return val.replace(lowerCaseLetters, (match: string): string => match.toUpperCase());
    };

export default toPascal;