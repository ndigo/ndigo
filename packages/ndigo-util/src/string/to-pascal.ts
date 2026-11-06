/**
 * Converts strings to PascalCase.
 */
import toCamel from './to-camel.js';

const // Lower case letters at the beginning of a string
    lowerCaseLetters = /^[a-z]/,
    /**
     * Returns the pascal case version of a string.
     *
     * @param value - The input string.
     * @returns The PascalCase version.
     *
     * @example
     * ```ts
     * toPascal('lorem-ipsum-dolor'); //=> "LoremIpsumDolor"
     * ```
     *
     * @see {@link http://wiki.c2.com/?PascalCase}
     */
    toPascal: (value: string) => string = (val: string): string => {
        val = toCamel(val);
        return val.replace(lowerCaseLetters, (match: string): string => match.toUpperCase());
    };

export default toPascal;
