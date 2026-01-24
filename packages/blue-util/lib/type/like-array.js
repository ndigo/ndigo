/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { __, both, cond, dec, either, F, gt, has, isNil, length, pipe, propEq, propSatisfies, T, toString, } from 'ramda';
import isString from './is-string';
/**
 * Determines whether a given object is an array-like.
 * @function module:util.likeArray
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is an array-like.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1hcnJheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2xpa2UtYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUNILEVBQUUsRUFDRixJQUFJLEVBQ0osSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNLEVBQ04sQ0FBQyxFQUNELEVBQUUsRUFDRixHQUFHLEVBQ0gsS0FBSyxFQUNMLE1BQU0sRUFDTixJQUFJLEVBQ0osTUFBTSxFQUNOLGFBQWEsRUFDYixDQUFDLEVBQ0QsUUFBUSxHQUNYLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBRW5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUMzQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUN0QyxxQkFBcUIsR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsRUFDMUQsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUN2QyxPQUFPLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNsQixZQUFZLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQ3RELFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxFQUNsRCxTQUFTLEdBQUcsSUFBSSxDQUFlO0lBQzNCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNWLENBQUMsTUFBTSxDQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDO0lBQzFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFNLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN6RCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDVCxDQUF1QyxDQUFDO0FBRTdDLGVBQWUsU0FBUyxDQUFDIn0=