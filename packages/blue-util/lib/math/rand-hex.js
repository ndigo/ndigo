/**
 * @author Jeff Rose
 */
import randInt from './rand-int';
/**
 * Generates a pseudo-random hexidecimal of the provided `size`.
 * @category Math
 * @param {number} [size=6] The size of the hexidecimal.
 * @returns {string} A pseudo-random hexidecimal of the provided `size`.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZC1oZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWF0aC9yYW5kLWhleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUVqQzs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFDdEMsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUN2QixPQUFPLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFVLEVBQUU7SUFDM0IsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDWixJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUViLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNaLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVOLGVBQWUsT0FBTyxDQUFDIn0=