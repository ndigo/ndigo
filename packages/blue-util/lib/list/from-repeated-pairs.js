/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * Creates a new object from a list key-value pairs. If a key appears in multiple pairs, the corresponding value will be an array.
 * @function module:util.fromRepeatedPairs
 * @category List
 * @see {@link module:util.fromPairs}
 * @see {@link module:util.pair}
 * @see {@link module:util.toPairs}
 */
const fromRepeatedPairs = (pairs) => {
    const result = {};
    let index = 0;
    while (index < pairs.length) {
        const [key, value] = pairs[index];
        if (!result.hasOwnProperty(key)) {
            result[key] = value;
        }
        else if (Array.isArray(result[key])) {
            result[key].push(value);
        }
        else {
            result[key] = [result[key], value];
        }
        index += 1;
    }
    return result;
};
export default fromRepeatedPairs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1yZXBlYXRlZC1wYWlycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L2Zyb20tcmVwZWF0ZWQtcGFpcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUg7Ozs7Ozs7R0FPRztBQUNILE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxLQUFtQixFQUF5QixFQUFFO0lBQ3JFLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxPQUFPLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLENBQUM7YUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLGVBQWUsaUJBQWlCLENBQUMifQ==