/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#replaceAccents}
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
    decomposeCombinedGraphemes = (text: string): string => text.normalize('NFD'),
    removeCombiningMarks = (text: string) => text.replace(combiningCharacters, ''),
    // These are not covered by using normalize()
    replaceAccentAA = (text: string) => text.replace(upperAA, 'AA').replace(lowerAA, 'aa'),
    replaceAccentAE = (text: string) => text.replace(upperAE, 'AE').replace(lowerAE, 'ae'),
    replaceAccentB = (text: string) => text.replace(upperB, 'B'),
    replaceAccentF = (text: string) => text.replace(lowerF, 'f'),
    replaceAccentD = (text: string) => text.replace(upperD, 'D').replace(lowerD, 'd'),
    replaceAccentO = (text: string) => text.replace(upperO, 'O').replace(lowerO, 'o'),
    replaceAccentOE = (text: string) => text.replace(upperOE, 'OE').replace(lowerOE, 'oe'),
    replaceAccentP = (text: string) => text.replace(upperP, 'P').replace(lowerP, 'p'),
    /**
     * Replace accented chars with regular ones
     * @category String
     * @param {string} value The string to be transformed.
     * @returns {string} The `value` with the accented characters replaced with regular ones.
     * @example
     * replaceDiacritics( "spéçïãl çhârs" );
     * //=> "special chars"
     * @see {@link https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript}
     */
    hasAccentedChars = (value: string) => {
        accented.lastIndex = 0;
        return accented.test(value);
    },
    replaceDiacritics = (text: string) => {
        if (!hasAccentedChars(text)) return text;
        return decomposeCombinedGraphemes(text)
            .replace(combiningCharacters, '')
            .replace(upperAA, 'AA').replace(lowerAA, 'aa')
            .replace(upperAE, 'AE').replace(lowerAE, 'ae')
            .replace(upperB, 'B')
            .replace(upperD, 'D').replace(lowerD, 'd')
            .replace(lowerF, 'f')
            .replace(upperO, 'O').replace(lowerO, 'o')
            .replace(upperOE, 'OE').replace(lowerOE, 'oe')
            .replace(upperP, 'P').replace(lowerP, 'p');
    };

export default replaceDiacritics;