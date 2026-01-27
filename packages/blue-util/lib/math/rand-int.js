/**
 * @author Jeff Rose
 */
import rand from './rand';
/**
 * Generates a pseudo-random integer between `min` and `max`.
 * @category Math
 * @param {number} [min=Number.MIN_SAFE_INTEGER]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number} A pseudo-random integer between `min` and `max`.
 * @example
 * randInt( 0, 10 );
 * //=> 7
 * randInt( 0, 10 );
 * //=> 6
 */
const randInt = (min, max) => {
    min = typeof min !== 'number' ? Number.MIN_SAFE_INTEGER : ~~min;
    max = typeof max !== 'number' ? Number.MAX_SAFE_INTEGER : ~~max;
    // can't be max + 0.5 otherwise it will round up if `rand`
    // returns `max` causing it to overflow range.
    // -0.5 and + 0.49 are required to avoid bias caused by rounding
    return Math.round(rand(min - 0.5, max + 0.499999999999));
};
export default randInt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZC1pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWF0aC9yYW5kLWludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUUxQjs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBWSxFQUFFLEdBQVksRUFBVSxFQUFFO0lBQ25ELEdBQUcsR0FBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNoRSxHQUFHLEdBQUcsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDaEUsMERBQTBEO0lBQzFELDhDQUE4QztJQUM5QyxnRUFBZ0U7SUFDaEUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMsQ0FBQztBQUVGLGVBQWUsT0FBTyxDQUFDIn0=