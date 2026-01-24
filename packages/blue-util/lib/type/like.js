/**
 * @author Jeff Rose
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @see {@link https://ramdajs.com/docs/}
 */
import { allPass, complement, curry, either, equals, has, is, isNil, map, pipe, prepend, propSatisfies, toPairs, } from 'ramda';
/**
 * Determines whether a given value matches the criteria.
 * @function module:util.like
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` matches the criteria.
 * @example
 * const wxy = { w: true, x: Number, y: Number };
 * like( wxy, { w: {}, x: 123, y: 456 } );
 * //=> true
 * like( wxy, { w: 'abc', x: 123, z: 789 } );
 * //=> false
 *
 * const likeWXY = like( wxy );
 * likeWXY( { w: {}, x: 123, y: 456 } );
 * //=> true
 * likeWXY( { w: 'abc', x: 123, y: 456, z: 789 } );
 * //=> true
 * likeWXY( { w: true, x: 123, y: '456' } );
 * //=> false
 * likeWXY( { w: 0, x: 123, z: 789 } );
 * //=> false
 * @see {@link https://en.wikipedia.org/wiki/Duck_typing}
 */
const isDefined = complement(isNil), isNull = equals(null), toPredicate = ([key, type]) => type === true ? has(key) : propSatisfies(either(is(type), isNull), key), 
// @ts-ignore
toPredicates = pipe(toPairs, map(toPredicate), prepend(isDefined)), likeDescriptor = pipe(toPredicates, allPass), like = (descriptor, value) => likeDescriptor(descriptor)(value);
const likeCurried = curry(like);
export default likeCurried;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2xpa2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFDSCxPQUFPLEVBQ1AsVUFBVSxFQUNWLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLEdBQUcsRUFDSCxFQUFFLEVBQ0YsS0FBSyxFQUNMLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLGFBQWEsRUFDYixPQUFPLEdBQ1YsTUFBTSxPQUFPLENBQUM7QUFTZjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQy9CLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQ3JCLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBNEIsRUFBRSxFQUFFLENBQ3JELElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBVyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ2xGLGFBQWE7QUFDYixZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQ2xFLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBdUQsRUFDbEcsSUFBSSxHQUFHLENBQUMsVUFBMEIsRUFBRSxLQUFLLEVBQVcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUU3RixNQUFNLFdBQVcsR0FBaUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlDLGVBQWUsV0FBVyxDQUFDIn0=