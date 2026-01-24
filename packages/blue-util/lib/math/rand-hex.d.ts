/**
 * @author Jeff Rose
 */
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
declare const randHex: (size?: number) => string;
export default randHex;
//# sourceMappingURL=rand-hex.d.ts.map