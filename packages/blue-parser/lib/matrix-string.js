const commaMatcher = /,/, percentEncoded = /(%[0-9A-Za-z]{2})+/g, plus = /\+/g, prefixMatcher = /^[;]/, createNull = Object.create.bind(Object, null), percentDecode = (value) => value.replace(percentEncoded, decodeURIComponent), formatter = (key, value, accumulator) => {
    if (commaMatcher.exec(value)) {
        accumulator[key] = value.split(',');
    }
    else {
        accumulator[key] = value;
    }
}, parseParameterList = (parse, delimiter, text) => text.split(delimiter).reduce(function (accumulator, parameter) {
    const parts = parameter.replace(plus, ' ').split('='), key = percentDecode(parts.shift());
    let value = parts.length > 0 ? parts.join('=') : undefined;
    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value = value === undefined ? null : percentDecode(value);
    parse(key, value, accumulator);
    return accumulator;
}, createNull()), 
/**
 * Parses a matrix string into an object.
     * @param {string} text The matrix string
 * @returns {Object} The parsed matrix string.
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
class MatrixString {
    parse(value) {
        return fromMatrixString(value);
    }
}
export default new MatrixString();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0cml4LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXRyaXgtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlEQSxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQ3BCLGNBQWMsR0FBRyxxQkFBcUIsRUFDdEMsSUFBSSxHQUFHLEtBQUssRUFDWixhQUFhLEdBQUcsTUFBTSxFQUN0QixVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUM3QyxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLEVBQzVGLFNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUUsV0FBZ0IsRUFBUSxFQUFFO0lBQy9ELElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzNCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7U0FBTSxDQUFDO1FBQ0osV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0FBQ0wsQ0FBQyxFQUNELGtCQUFrQixHQUFHLENBQUMsS0FBaUIsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBTyxFQUFFLENBQzdFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsV0FBZ0IsRUFBRSxTQUFpQjtJQUN0RSxNQUFNLEtBQUssR0FBYSxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQzNELEdBQUcsR0FBVyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDL0MsSUFBSSxLQUFLLEdBQVcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUVuRSxnQ0FBZ0M7SUFDaEMsZ0VBQWdFO0lBQ2hFLEtBQUssR0FBRyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUxRCxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUvQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEI7Ozs7O0dBS0c7QUFDSCxnQkFBZ0IsR0FBRyxDQUFDLElBQVksRUFBNkIsRUFBRTtJQUMzRCxJQUFJLE1BQU0sR0FBUSxVQUFVLEVBQUUsQ0FBQztJQUUvQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFOUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1IsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRWxELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxNQUFXLEVBQUUsR0FBVztRQUNoRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQUVOLE1BQU0sWUFBWTtJQUNkLEtBQUssQ0FBQyxLQUFhO1FBQ2YsT0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7QUFFRCxlQUFlLElBQUksWUFBWSxFQUFFLENBQUMifQ==