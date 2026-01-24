/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#sentenceCase}
 */
import { pipe, toLower, toUpper } from 'ramda';
const regex = /(^\w)|\.\s+(\w)/gm;
/**
 * Returns the sentence case version of a string.
 * @function module:util.toSentence
 * @param {external:string} value
 * @returns {external:string}
 * @category String
 * @example
 * toSentence( 'lorem-ipsum-dolor' );
 * //=> "Lorem ipsum dolor"
 */
const toSentence = pipe(toLower, (value) => value.replace(regex, toUpper));
export default toSentence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tc2VudGVuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL3RvLXNlbnRlbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFL0MsTUFBTSxLQUFLLEdBQUcsbUJBQW1CLENBQUM7QUFFbEM7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLEdBQThCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFhLEVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFFdEgsZUFBZSxVQUFVLENBQUMifQ==