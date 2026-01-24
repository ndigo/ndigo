/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#properCase}
 */
import { pipe, toLower, toUpper } from 'ramda';
const regex = /^\w|\s\w/g;
/**
 * Returns the proper case version of a string.
 * @function module:util.toProper
 * @param {external:string} value
 * @returns {external:string}
 * @category String
 * @example
 * toProper( 'lorem-ipsum-dolor' );
 * //=> "Lorem Ipsum Dolor"
 */
const toProper = pipe(toLower, (value) => value.replace(regex, toUpper));
export default toProper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tcHJvcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmluZy90by1wcm9wZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUUvQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUM7QUFFMUI7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxRQUFRLEdBQThCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFhLEVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFFcEgsZUFBZSxRQUFRLENBQUMifQ==