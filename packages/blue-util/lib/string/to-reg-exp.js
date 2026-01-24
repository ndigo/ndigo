/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { pipe, replace, test } from 'ramda';
const regExpFlags = /[gimsuy]+/g, leadingSlash = /^\//, trailingSlashAndFlags = /\/([gimsuy]*)$/, patternWithTrailingSlashAndFlags = /.+\/([gimsuy]*)$/, cache = new Map(), hasValidFlags = test(regExpFlags), removeLeadingSlash = replace(leadingSlash, ''), removeTrailingSlashAndFlags = replace(trailingSlashAndFlags, ''), extractFlags = replace(patternWithTrailingSlashAndFlags, '$1'), removeSlashesAndFlags = pipe(removeLeadingSlash, removeTrailingSlashAndFlags);
/**
 * Returns a regular expression for the given `pattern`.
 * @function module:util.toRegExp
 * @param {external:string} value
 * @returns {external:RegExp}
 * @example
 * toRegExp( 'foo' );
 * //=> /foo/
 * toRegExp( '/foo/' );
 * //=> /foo/
 * toRegExp( '/foo/i' );
 * //=> /foo/i
 * @category String
 */
const toRegExp = (value) => {
    let regex;
    if (cache.has(value)) {
        regex = cache.get(value);
    }
    else {
        const flags = extractFlags(value), pattern = removeSlashesAndFlags(value);
        regex = hasValidFlags(flags) ? new RegExp(pattern, flags) : new RegExp(pattern);
        cache.set(value, regex);
    }
    return regex;
};
export default toRegExp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tcmVnLWV4cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvdG8tcmVnLWV4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUMsTUFBTSxXQUFXLEdBQUcsWUFBWSxFQUM1QixZQUFZLEdBQUcsS0FBSyxFQUNwQixxQkFBcUIsR0FBRyxnQkFBZ0IsRUFDeEMsZ0NBQWdDLEdBQUcsa0JBQWtCLEVBQ3JELEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBa0IsRUFDakMsYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDakMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFDOUMsMkJBQTJCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxFQUNoRSxZQUFZLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLElBQUksQ0FBQyxFQUM5RCxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztBQUVsRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFhLEVBQVUsRUFBRTtJQUN2QyxJQUFJLEtBQWEsQ0FBQztJQUVsQixJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNuQixLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO1NBQU0sQ0FBQztRQUNKLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFDN0IsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLGVBQWUsUUFBUSxDQUFDIn0=