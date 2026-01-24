/**
 * @author Jeff Rose
 */

import randInt from './rand-int';

/**
 * Generates a pseudo-random hexidecimal of the provided `size`.
 * @function module:util.randHex
 * @category Math
 * @param {external:number} [size=6] The size of the hexidecimal.
 * @returns {external:string} A pseudo-random hexidecimal of the provided `size`.
 * @example
 * randHex();
 * // "dd8575"
 * randHex();
 * // "e6baeb"
 * randHex( 2 );
 * // "a2"
 * randHex( 30 );
 * // "effd7e2ad9a4a3067e30525fab983a"
 */
const
    chars = '0123456789abcdef'.split( '' ),
    last = chars.length - 1,

    randHex = ( size = 6 ): string => {
        if( size <= 0 ){
            size = 6;
        }

        let hex = '';

        while( size-- ){
            hex += chars[ randInt( 0, last ) ];
        }

        return hex;
    };

export default randHex;
