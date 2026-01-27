/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curryN, slice, split, trim } from 'ramda';
/**
 * Splits a string into an array of strings based on the given separator.
 * @param {string} separator
 * @param {string} text
 * @returns {Array<external:string>}
 * @category String
 * @example
 * const trailingSplitOnPipe = trailingSplit( "|" );
 * trailingSplitOnPipe( "a|b|c|" );
 * //=> [ "a", "b", "c" ]
 * trailingSplit( ",", "a,b,c," );
 * //=> [ "a", "b", "c" ]
 */
const trailingSplit = curryN(2, (separator, text) => {
    text = trim(text);
    const length = text.length;
    if (length && text.indexOf(separator) !== -1) {
        const tail = length - 1, isSeparatorTrailing = text[tail] === separator, isEmptyString = isSeparatorTrailing && text[length - 2] === separator;
        return split(separator, isSeparatorTrailing && !isEmptyString ? slice(0, tail, text) : text);
    }
    return [text];
});
export default trailingSplit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhaWxpbmctc3BsaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL3RyYWlsaW5nLXNwbGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFPbkQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxhQUFhLEdBQTBCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFpQixFQUFFLElBQVksRUFBWSxFQUFFO0lBQ2pHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUUzQixJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFDbkIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFDOUMsYUFBYSxHQUFHLG1CQUFtQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDO1FBQzFFLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLGFBQWEsQ0FBQyJ9