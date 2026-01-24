/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 * @see {@link https://hackernoon.com/arcsecond-parsing-in-javascript-made-easy-af1894bdcec9}
 */
// @ts-ignore
import { Parser } from 'arcsecond';
const updateResult = (state, result) => ({ ...state, result }), noop = new Parser(function (state) {
    if (state.isError)
        return state;
    const results = null;
    return updateResult(state, results);
});
export default noop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8tb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbm8tb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILGFBQWE7QUFDYixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5DLE1BQU0sWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQzFELElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUs7SUFDN0IsSUFBSSxLQUFLLENBQUMsT0FBTztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztJQUNyQixPQUFPLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFFUCxlQUFlLElBQUksQ0FBQyJ9