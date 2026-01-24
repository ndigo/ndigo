/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curryN, slice, split, trim } from 'ramda';
/**
 * Splits a string into an array of strings based on the given separator.
 * @function module:util.trailingSplit
 * @param {external:string} separator
 * @param {external:string} text
 * @returns {external:Array<external:string>}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhaWxpbmctc3BsaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL3RyYWlsaW5nLXNwbGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFPbkQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sYUFBYSxHQUEwQixNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBaUIsRUFBRSxJQUFZLEVBQVksRUFBRTtJQUNqRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFM0IsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLEVBQ25CLG1CQUFtQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEVBQzlDLGFBQWEsR0FBRyxtQkFBbUIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztRQUMxRSxPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxhQUFhLENBQUMifQ==