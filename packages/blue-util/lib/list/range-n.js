/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curryN } from 'ramda';
const { abs, max } = Math, 
/**
 * @category List
 * @param {number} step The amount by which the first number will be incremented or decremented.
 * @param {number} from The first number in the list.
 * @param {number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @returns {Array} The list of numbers in the set `[a, b)` adjusted by the step amount.
 * @example
 * rangeN( 2, 0, 5 );
 * //=> [ 0, 2, 4 ]
 *
 * const rangeThree = rangeN( 3 );
 * rangeThree( 2, 10 );
 * //=> [ 2, 5, 8 ]
 * @see {@link range}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2Utbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L3JhbmdlLW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVEvQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFDckI7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLEdBQW1CLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLEVBQVcsRUFBWSxFQUFFO0lBQ3JGLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDaEIsRUFBRSxHQUFHLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxvQkFBb0I7SUFDcEIsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDYixJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUNELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2IsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDRCxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNYLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFekIsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsRUFDeEIsTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUUxQixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsRCxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUM7QUFFUCxlQUFlLE1BQU0sQ0FBQyJ9