/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#replaceAccents}
 */

import { pipe, replace, test, when } from 'ramda';

const
    accented            = /[\xC0-\xFF\u0152\u0153\u0160\u0161\u0178\u0192\uA732\uA733]/g,
    combiningCharacters = /[\u0300-\u036f]/g,
    upperAA             = /[\uA732]/g,
    upperAE             = /[\xC6]/g,
    upperB              = /[\xDF]/g,
    upperD              = /[\xD0]/g,
    upperO              = /[\xD8]/g,
    upperOE             = /[\u0152]/g,
    upperP              = /[\xDE]/g,
    lowerAA             = /[\uA733]/g,
    lowerAE             = /[\xE6]/g,
    lowerD              = /[\xF0]/g,
    lowerF              = /[\u0192]/g,
    lowerO              = /[\xF8]/g,
    lowerOE             = /[\u0153]/g,
    lowerP              = /[\xFE]/g,

    decomposeCombinedGraphemes = ( text: string ): string => text.normalize( 'NFD' ),
    removeCombiningMarks = replace( combiningCharacters, '' ),

    // These are not covered by using normalize()
    replaceAccentAA = pipe( replace( upperAA, 'AA' ), replace( lowerAA, 'aa' ) ),
    replaceAccentAE = pipe( replace( upperAE, 'AE' ), replace( lowerAE, 'ae' ) ),
    replaceAccentB  = replace( upperB, 'B' ),
    replaceAccentF  = replace( lowerF, 'f' ),
    replaceAccentD  = pipe( replace( upperD , 'D'  ), replace( lowerD,  'd'  ) ),
    replaceAccentO  = pipe( replace( upperO , 'O'  ), replace( lowerO , 'o'  ) ),
    replaceAccentOE = pipe( replace( upperOE, 'OE' ), replace( lowerOE, 'oe' ) ),
    replaceAccentP  = pipe( replace( upperP , 'P'  ), replace( lowerP , 'p'  ) ),

    /**
     * Replace accented chars with regular ones
     * @function module:util.replaceDiacritics
     * @category String
     * @param {external:string} value The string to be transformed.
     * @returns {external:string} The `value` with the accented characters replaced with regular ones.
     * @example
     * replaceDiacritics( "spéçïãl çhârs" );
     * //=> "special chars"
     * @see {@link https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript}
     */
    replaceDiacritics = when( test( accented ), pipe( decomposeCombinedGraphemes, removeCombiningMarks, replaceAccentAA, replaceAccentAE, replaceAccentB, replaceAccentD, replaceAccentF, replaceAccentO, replaceAccentOE, replaceAccentP ) );

export default replaceDiacritics;
