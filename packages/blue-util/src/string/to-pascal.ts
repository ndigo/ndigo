/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#pascalCase}
 */

import { pipe } from 'ramda';

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
    toPascal: (value: string) => string = pipe(toCamel, (value: string): string =>
        value.replace(lowerCaseLetters, (match: string): string => match.toUpperCase())
    );

export default toPascal;
