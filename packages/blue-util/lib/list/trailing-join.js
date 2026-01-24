/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { append, curry, join } from 'ramda';
/**
 * Returns a string made by inserting the separator after each element and concatenating all the elements into a single string.
 * @function module:util.trailingJoin
 * @category List
 * @param {external:string} separator The string that will be placed between list items.
 * @param {external:Array} list The list to be joined.
 * @returns {external:string} The concatenated list.
 * @example
 * const trailingJoinOnColon = trailingJoin( ":" );
 * trailingJoinOnColon( [ "a", "b", "c" ] );
 * //=> "a:b:c:"
 * trailingJoin( ",", [ "a", "b", "c" ] );
 * //=> "a,b,c,"
 */
const trailingJoin = curry((separator, list) => join(separator, append('', list)));
export default trailingJoin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhaWxpbmctam9pbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L3RyYWlsaW5nLWpvaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBTzVDOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFNLFlBQVksR0FBeUIsS0FBSyxDQUFDLENBQUMsU0FBaUIsRUFBRSxJQUFXLEVBQVUsRUFBRSxDQUN4RixJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FDcEMsQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIn0=