/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { __, both, cond, dec, either, F, gt, has, isNil, length, pipe, propEq, propSatisfies, T, toString, } from 'ramda';
import isString from './is-string.js';
/**
 * Determines whether a given object is an array-like.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is an array-like.
 * @example
 * likeArray( [] );
 * //=> true
 * likeArray( '' );
 * //=> true
 * likeArray( { 0: 'zero', 9: 'nine', length: 10 } );
 * //=> true
 * likeArray( { length: 0 } );
 * //=> true
 * likeArray( { length: 10 } );
 * //=> false
 * likeArray( {} );
 * //=> false
 */
const nodeTypeEqualsOne = propEq('nodeType', 1), lengthEqualsZero = propEq('length', 0), lengthGreaterThanZero = propSatisfies(gt(__, 0), 'length'), lastIndex = pipe(length, dec, toString), hasZero = has('0'), hasLastIndex = (value) => has(lastIndex(value), value), isNotObject = (value) => typeof value !== 'object', likeArray = cond([
    [isNil, F],
    [either(Array.isArray, isString), T],
    [isNotObject, F],
    [nodeTypeEqualsOne, lengthGreaterThanZero],
    [lengthEqualsZero, T],
    [lengthGreaterThanZero, both(hasZero, hasLastIndex)],
    [T, F],
]);
export default likeArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1hcnJheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2xpa2UtYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUNILEVBQUUsRUFDRixJQUFJLEVBQ0osSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNLEVBQ04sQ0FBQyxFQUNELEVBQUUsRUFDRixHQUFHLEVBQ0gsS0FBSyxFQUNMLE1BQU0sRUFDTixJQUFJLEVBQ0osTUFBTSxFQUNOLGFBQWEsRUFDYixDQUFDLEVBQ0QsUUFBUSxHQUNYLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFFdEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFDM0MsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFDdEMscUJBQXFCLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQzFELFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFDdkMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDbEIsWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUN0RCxXQUFXLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFDbEQsU0FBUyxHQUFHLElBQUksQ0FBZTtJQUMzQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDVixDQUFDLE1BQU0sQ0FBTSxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQztJQUMxQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNyQixDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBTSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ1QsQ0FBdUMsQ0FBQztBQUU3QyxlQUFlLFNBQVMsQ0FBQyJ9