/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { is } from 'ramda';
/**
 * Determines whether a given object is a string.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a string.
 * @example
 * isString( new String( 'hello' ) );
 * //=> true
 * isString( 'hello' } );
 * //=> true
 * isString( {} );
 * //=> false
 */
const isString = is(String);
export default isString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGUvaXMtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFM0I7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBK0IsQ0FBQztBQUUxRCxlQUFlLFFBQVEsQ0FBQyJ9