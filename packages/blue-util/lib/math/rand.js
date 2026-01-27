/**
 * @author Jeff Rose
 */
import random from './random';
/**
 * Generates a pseudo-random number between `min` and `max`.
 * @category Math
 * @param {number} [min=Number.MIN_SAFE_INTEGER]
 * @param {number} [max=Number.MAX_SAFE_INTEGER]
 * @returns {number} A pseudo-random number between `min` and `max`.
 * @example
 * rand( 0, 10 );
 * //=> 7.369723
 * rand( 0, 10 );
 * //=> 5.987042
 */
const rand = (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => min + (max - min) * random();
export default rand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXRoL3JhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFFOUI7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRTVHLGVBQWUsSUFBSSxDQUFDIn0=