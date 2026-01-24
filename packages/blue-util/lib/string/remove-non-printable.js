/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonASCII}
 */
import { replace } from 'ramda';
// Matches non-printable ASCII chars -
// http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
const nonPrintable = /[^\x20-\x7E]/g;
/**
 * Remove non-printable characters
 * @function module:util.removeNonPrintable
 * @param {external:string} value The string to be transformed.
 * @returns {external:string} The `value` with the non-printable characters removed.
 * @example
 * removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
 * //=> "lorem-ipsum"
 * @category String
 */
const removeNonPrintable = replace(nonPrintable, '');
export default removeNonPrintable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLW5vbi1wcmludGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL3JlbW92ZS1ub24tcHJpbnRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRWhDLHNDQUFzQztBQUN0QyxnRUFBZ0U7QUFDaEUsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDO0FBRXJDOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sa0JBQWtCLEdBQThCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFaEYsZUFBZSxrQkFBa0IsQ0FBQyJ9