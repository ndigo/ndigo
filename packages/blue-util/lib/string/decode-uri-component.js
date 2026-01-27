/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://github.com/samverschueren/decode-uri-component}
 */
import { concat, join, match, reduce, replace, unapply } from 'ramda';
const token = '%[a-f0-9]{2}', singleMatcher = new RegExp(token, 'gi'), multiMatcher = new RegExp(`(${token})+`, 'gi'), plusMatcher = /\+/g, concatAll = unapply(reduce(concat, [])), joinOnEmptyString = join(''), matchSingleToken = match(singleMatcher), replacePlusWithSpace = replace(plusMatcher, ' ');
function decode(input) {
    try {
        return decodeURIComponent(input);
    }
    catch (error) {
        let tokens = matchSingleToken(input), index = 1;
        for (; index < tokens.length; index++) {
            input = joinOnEmptyString(decodeURIComponentList(tokens, index));
            tokens = matchSingleToken(input);
        }
        return input;
    }
}
function decodeURIComponentList(components, index = 1) {
    try {
        // Try to decode the entire string first
        return [decodeURIComponent(joinOnEmptyString(components))];
    }
    catch (error) {
        // Do nothing
    }
    if (components.length === 1) {
        return components;
    }
    // Split the array in 2 parts
    const left = components.slice(0, index), right = components.slice(index);
    return concatAll([], decodeURIComponentList(left), decodeURIComponentList(right));
    //return Array.prototype.concat.call( [], decodeURIComponentList( left ), decodeURIComponentList( right ) );
}
function enhancedDecodeURIComponent(input) {
    // Keep track of all the replacements and prefill the map with the `BOM`
    const replaceMap = {
        '%FE%FF': '\uFFFD\uFFFD',
        '%FF%FE': '\uFFFD\uFFFD',
    };
    let match = multiMatcher.exec(input);
    while (match) {
        try {
            // Decode as big chunks as possible
            replaceMap[match[0]] = decodeURIComponent(match[0]);
        }
        catch (error) {
            const result = decode(match[0]);
            if (result !== match[0]) {
                replaceMap[match[0]] = result;
            }
        }
        match = multiMatcher.exec(input);
    }
    // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
    replaceMap['%C2'] = '\uFFFD';
    const entries = Object.keys(replaceMap), length = entries.length;
    let index = 0, key;
    for (; index < length; index++) {
        // Replace all decoded components
        key = entries[index];
        input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
    }
    return input;
}
/**
 * Enhanced decodeURIComponent
 * - Decodes + to a space.
 * - Converts the BOM to a replacement character �.
 * - Does not throw with invalid encoded input.
 * - Decodes as much of the string as possible.
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @category String
 */
export default function (value) {
    try {
        // Try the built in decoder first
        return decodeURIComponent(replacePlusWithSpace(value));
    }
    catch (error) {
        // Fallback to a more advanced decoder
        return enhancedDecodeURIComponent(value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb2RlLXVyaS1jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2RlY29kZS11cmktY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFdEUsTUFBTSxLQUFLLEdBQUcsY0FBYyxFQUN4QixhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUN2QyxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLENBQUMsRUFDOUMsV0FBVyxHQUFHLEtBQUssRUFDbkIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQXFCLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUMzRCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFnQyxFQUMzRCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUF3QyxFQUM5RSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXJELFNBQVMsTUFBTSxDQUFDLEtBQWE7SUFDekIsSUFBSSxDQUFDO1FBQ0QsT0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLElBQUksTUFBTSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUNoQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsT0FBTyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENB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