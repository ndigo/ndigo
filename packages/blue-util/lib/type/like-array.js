/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { __, both, cond, dec, either, F, gt, has, isNil, length, pipe, propEq, propSatisfies, T, toString, } from 'ramda';
import isString from './is-string';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1hcnJheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2xpa2UtYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUNILEVBQUUsRUFDRixJQUFJLEVBQ0osSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNLEVBQ04sQ0FBQyxFQUNELEVBQUUsRUFDRixHQUFHLEVBQ0gsS0FBSyxFQUNMLE1BQU0sRUFDTixJQUFJLEVBQ0osTUFBTSxFQUNOLGFBQWEsRUFDYixDQUFDLEVBQ0QsUUFBUSxHQUNYLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBRW5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQzNDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQ3RDLHFCQUFxQixHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUMxRCxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQ3ZDLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2xCLFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsRUFDdEQsV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQ2xELFNBQVMsR0FBRyxJQUFJLENBQWU7SUFDM0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxNQUFNLENBQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLENBQUM7SUFDMUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQU0sT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3pELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNULENBQXVDLENBQUM7QUFFN0MsZUFBZSxTQUFTLENBQUMifQ==