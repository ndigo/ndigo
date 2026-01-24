/**
 * @author Jeff Rose
 */
import { decodeURIComponent as decode } from '@blue/util';
const commaMatcher = /,/, plusMatcher = /\+/g, prefixMatcher = /^[;]/, createNull = Object.create.bind(Object, null), formatter = (key, value, accumulator) => {
    if (commaMatcher.exec(value)) {
        accumulator[key] = value.split(',');
    }
    else {
        accumulator[key] = value;
    }
}, parseParameterList = (parse, delimiter, text) => text.split(delimiter).reduce(function (accumulator, parameter) {
    const parts = parameter.replace(plusMatcher, ' ').split('='), key = decode(parts.shift());
    let value = parts.length > 0 ? parts.join('=') : undefined;
    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value = value === undefined ? null : decode(value);
    parse(key, value, accumulator);
    return accumulator;
}, createNull()), 
/**
 * Parses a matrix string into an object.
 * @function module:router.fromMatrixString
 * @param {external:string} text The matrix string
 * @returns {external:Object} The parsed matrix string.
 * @category String
 */
fromMatrixString = (text) => {
    let parsed = createNull();
    text = text.trim().replace(prefixMatcher, '');
    if (!text) {
        return parsed;
    }
    parsed = parseParameterList(formatter, ';', text);
    return Object.keys(parsed).reduce(function (result, key) {
        result[key] = parsed[key];
        return result;
    }, createNull());
};
export default fromMatrixString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1tYXRyaXgtc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Zyb20tbWF0cml4LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJMUQsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUNwQixXQUFXLEdBQUcsS0FBSyxFQUNuQixhQUFhLEdBQUcsTUFBTSxFQUN0QixVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUM3QyxTQUFTLEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLFdBQWdCLEVBQVEsRUFBRTtJQUMvRCxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMzQixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QyxDQUFDO1NBQU0sQ0FBQztRQUNKLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztBQUNMLENBQUMsRUFDRCxrQkFBa0IsR0FBRyxDQUFDLEtBQWlCLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQU8sRUFBRSxDQUM3RSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLFdBQWdCLEVBQUUsU0FBaUI7SUFDdEUsTUFBTSxLQUFLLEdBQWEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNsRSxHQUFHLEdBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLElBQUksS0FBSyxHQUFXLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFbkUsZ0NBQWdDO0lBQ2hDLGdFQUFnRTtJQUNoRSxLQUFLLEdBQUcsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFL0IsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3BCOzs7Ozs7R0FNRztBQUNILGdCQUFnQixHQUFHLENBQUMsSUFBWSxFQUE2QixFQUFFO0lBQzNELElBQUksTUFBTSxHQUFRLFVBQVUsRUFBRSxDQUFDO0lBRS9CLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDUixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFbEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE1BQVcsRUFBRSxHQUFXO1FBQ2hFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFDO0FBRU4sZUFBZSxnQkFBZ0IsQ0FBQyJ9