/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import rangeN from './range-n';
/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
 *
 * @category List
 * @param {number} from The first number in the list.
 * @param {number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @returns {Array} The list of numbers in the set `[a, b)`.
 * @example
 * range( 1 );
 * //=> []
 * range( 1, 1 );
 * //=> []
 * range( 1, 1.1 );
 * //=> [ 1 ]
 * range( 1, 5 );
 * //=> [ 1, 2, 3, 4 ]
 * range( 50, 53 );
 * //=> [ 50, 51, 52 ]
 * @see {@link rangeBy}
 */
export default rangeN(1);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGlzdC9yYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUM7QUFFL0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxlQUFlLE1BQU0sQ0FBQyxDQUFDLENBQTRDLENBQUMifQ==