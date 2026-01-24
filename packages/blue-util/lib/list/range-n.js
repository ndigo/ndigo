/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curryN } from 'ramda';
const { abs, max } = Math, 
/**
 * @function module:util.rangeN
 * @category List
 * @param {external:number} step The amount by which the first number will be incremented or decremented.
 * @param {external:number} from The first number in the list.
 * @param {external:number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @return {external:Array} The list of numbers in the set `[a, b)` adjusted by the step amount.
 * @example
 * rangeN( 2, 0, 5 );
 * //=> [ 0, 2, 4 ]
 *
 * const rangeThree = rangeN( 3 );
 * rangeThree( 2, 10 );
 * //=> [ 2, 5, 8 ]
 * @see {@link module:util.range}
 */
rangeN = curryN(3, (step, from, to) => {
    if (to === void 0) {
        to = from;
    }
    // fix negative zero
    if (step === 0) {
        step = 0;
    }
    if (from === 0) {
        from = 0;
    }
    if (to === 0) {
        to = 0;
    }
    step = max(abs(step), 1);
    const descending = from > to, result = [];
    while (descending ? from > to : from < to) {
        result.push(from);
        from = descending ? from - step : from + step;
    }
    return result;
});
export default rangeN;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2Utbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L3JhbmdlLW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVEvQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFDckI7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxHQUFtQixNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxFQUFXLEVBQVksRUFBRTtJQUNyRixJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2hCLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsb0JBQW9CO0lBQ3BCLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2IsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDRCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNiLElBQUksR0FBRyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0QsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDWCxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpCLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLEVBQ3hCLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFFMUIsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEQsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBRVAsZUFBZSxNQUFNLENBQUMifQ==