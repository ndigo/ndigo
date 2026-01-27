/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://stackoverflow.com/questions/40922531/how-to-check-if-a-javascript-function-is-a-constructor}
 */
import { both, F, partial, pipe, T, tryCatch } from 'ramda';
import isFunction from './is-function';
const construct = partial(Reflect.construct, [String, []]), constructAndReturnTrue = pipe(construct, T);
/**
 * Determines whether a given value is a constructor, i.e. creates instances using `new`.
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a constructor.
 * @category Type
 */
const isConstructor = (value) => both(isFunction, tryCatch(constructAndReturnTrue, F))(value);
export default isConstructor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtY29uc3RydWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZS9pcy1jb25zdHJ1Y3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzVELE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQztBQUV2QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUN0RCxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRWhEOzs7OztHQUtHO0FBQ0gsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFVLEVBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQU0sVUFBVSxFQUFFLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTNILGVBQWUsYUFBYSxDQUFDIn0=