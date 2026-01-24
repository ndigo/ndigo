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
const chars = '0123456789abcdef'.split(''), last = chars.length - 1, randHex = (size = 6) => {
    if (size <= 0) {
        size = 6;
    }
    let hex = '';
    while (size--) {
        hex += chars[randInt(0, last)];
    }
    return hex;
};
export default randHex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZC1oZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWF0aC9yYW5kLWhleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUVqQzs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQ3RDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBVSxFQUFFO0lBQzNCLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFYixPQUFPLElBQUksRUFBRSxFQUFFLENBQUM7UUFDWixHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUM7QUFFTixlQUFlLE9BQU8sQ0FBQyJ9