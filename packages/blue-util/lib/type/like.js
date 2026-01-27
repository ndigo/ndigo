/**
 * @author Jeff Rose
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @see {@link https://ramdajs.com/docs/}
 */
import { allPass, complement, curry, either, equals, has, is, isNil, map, pipe, prepend, propSatisfies, toPairs, } from 'ramda';
/**
 * Determines whether a given value matches the criteria.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` matches the criteria.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlL2xpa2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFDSCxPQUFPLEVBQ1AsVUFBVSxFQUNWLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLEdBQUcsRUFDSCxFQUFFLEVBQ0YsS0FBSyxFQUNMLEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLGFBQWEsRUFDYixPQUFPLEdBQ1YsTUFBTSxPQUFPLENBQUM7QUFTZjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNILE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDL0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFDckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUE0QixFQUFFLEVBQUUsQ0FDckQsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDbEYsYUFBYTtBQUNiLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFDbEUsY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUF1RCxFQUNsRyxJQUFJLEdBQUcsQ0FBQyxVQUEwQixFQUFFLEtBQUssRUFBVyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTdGLE1BQU0sV0FBVyxHQUFpQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUMsZUFBZSxXQUFXLENBQUMifQ==