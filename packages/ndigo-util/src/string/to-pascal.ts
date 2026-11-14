/**
 * Converts strings to PascalCase.
 *
 * Inlined from the former toCamel/removeNonWord/replaceDiacritics helpers
 * (pruned in AD-84 follow-up): toPascal is the only retained string case
 * converter in the util package (see AD-84 D2).
 */

const accented = /[\xC0-\xFF\u0152\u0153\u0160\u0161\u0178\u0192\uA732\uA733]/g,
    combiningCharacters = /[\u0300-\u036f]/g,
    upperAA = /[\uA732]/g,
    upperAE = /[\xC6]/g,
    upperB = /[\xDF]/g,
    upperD = /[\xD0]/g,
    upperO = /[\xD8]/g,
    upperOE = /[\u0152]/g,
    upperP = /[\xDE]/g,
    lowerAA = /[\uA733]/g,
    lowerAE = /[\xE6]/g,
    lowerD = /[\xF0]/g,
    lowerF = /[\u0192]/g,
    lowerO = /[\xF8]/g,
    lowerOE = /[\u0153]/g,
    lowerP = /[\xFE]/g,
    dashes = /[-_]/g,
    lowerCaseLetters = /\s[a-z]/g,
    spaces = /\s+/g,
    upperCaseLetters = /^[A-Z]/g,
    nonWord = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g,
    lowerCaseInitial = /^[a-z]/,
    replaceDiacritics = (text: string): string => {
        accented.lastIndex = 0;
        if (!accented.test(text)) return text;
        accented.lastIndex = 0;
        return text
            .normalize('NFD')
            .replace(combiningCharacters, '')
            .replace(upperAA, 'AA')
            .replace(lowerAA, 'aa')
            .replace(upperAE, 'AE')
            .replace(lowerAE, 'ae')
            .replace(upperB, 'B')
            .replace(upperD, 'D')
            .replace(lowerD, 'd')
            .replace(lowerF, 'f')
            .replace(upperO, 'O')
            .replace(lowerO, 'o')
            .replace(upperOE, 'OE')
            .replace(lowerOE, 'oe')
            .replace(upperP, 'P')
            .replace(lowerP, 'p');
    };

/**
 * Returns the PascalCase version of a string.
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
const toPascal: (value: string) => string = (val: string): string => {
    val = replaceDiacritics(val);
    val = val.replace(nonWord, '');
    val = val.replace(dashes, ' ');
    val = val.replace(lowerCaseLetters, (match: string): string => match.toUpperCase());
    val = val.replace(spaces, '');
    val = val.replace(upperCaseLetters, (match: string): string => match.toLowerCase());
    val = val.replace(lowerCaseInitial, (match: string): string => match.toUpperCase());
    return val;
};

export default toPascal;
