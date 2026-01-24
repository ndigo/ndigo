/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { both, forEachObjIndexed, isString, join, lt, map, pipe, propSatisfies, T, encodeURIComponent as encode, trailingJoin, } from './_util';
const { isArray } = Array, greaterThanZero = lt(0), lengthGreaterThanZero = propSatisfies(greaterThanZero, 'length'), firstValueIsArray = propSatisfies(isArray, '0'), isMatrix = both(lengthGreaterThanZero, firstValueIsArray), 
// [1,2,3] -> "1,2,3,"
joinOnComma = trailingJoin(','), 
// [1,2,3] -> "1|2|3|"
joinOnPipe = trailingJoin('|'), 
// [[1,2],[3,4],[5,6]] -> "1,2&3,4&5,6&"
joinAllOnAmpersand = pipe(map(join(',')), trailingJoin('&'));
// There is some very questionable "logic" in this function. The reasons for it have
// been lost to history. I did not create the algorithm, just the latest two
// implementations of it. It is used to parse the Persona Cookie, which was part of
// the legacy platform. The strangest and probably most detrimental part is
// double-encoding of the param at the end. I'm not sure why that was deemed necessary.
// It means "," becomes "%252C" as opposed to just "%2C", which is what would happen
// with a single encoding. This makes the resulting string larger than it likely needs
// to be. While it would be easy to correct this code, it would likely lead to impacts
// elsewhere and therefore would need to be coordinated. The investment to resolve
// this problem is likely greater than the gains.
// -JBR
/**
 * Parses an object to piped list string.
 * @function module:util.toPipedString
 * @param {external:Object} object
 * @param {external:function} [validate]
 * @returns {external:string}
 * @example
 * toPipedString( { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" } );
 * //=> "abc=1,2,3,|def=456|ghi|jkl="
 * @category Object
 */
export default function toPipedString(object, validate = T) {
    const pipedString = [];
    let isValueArray, isValueMatrix, isValueValid, param;
    forEachObjIndexed(function (value, key) {
        isValueArray = isArray(value);
        isValueMatrix = isValueArray && isMatrix(value);
        isValueValid = validate(key, value);
        if (isValueValid) {
            // Translate 2-dimensional array
            // The internal arrays of a 2-dimensional array do not have trailing separators
            if (isValueMatrix) {
                value = joinAllOnAmpersand(value);
            }
            // Translate array
            if (isValueArray) {
                value = joinOnComma(value);
            }
            // Two-Dimensional Arrays do not get encoded values
            param = isValueMatrix ? `${encode(key)}=${value}` : encode(`${key}=${encode(value)}`);
            pipedString.push(isString(value) ? param : key);
        }
    }, object);
    return joinOnPipe(pipedString);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tcGlwZWQtc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RvLXBpcGVkLXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxPQUFPLEVBQ0gsSUFBSSxFQUNKLGlCQUFpQixFQUNqQixRQUFRLEVBQ1IsSUFBSSxFQUNKLEVBQUUsRUFDRixHQUFHLEVBQ0gsSUFBSSxFQUNKLGFBQWEsRUFDYixDQUFDLEVBQ0Qsa0JBQWtCLElBQUksTUFBTSxFQUM1QixZQUFZLEdBQ2YsTUFBTSxTQUFTLENBQUM7QUFFakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDckIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDdkIscUJBQXFCLEdBQUcsYUFBYSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsRUFDaEUsaUJBQWlCLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFDL0MsUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxpQkFBaUIsQ0FBZ0M7QUFDeEYsc0JBQXNCO0FBQ3RCLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUE2QjtBQUMzRCxzQkFBc0I7QUFDdEIsVUFBVSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7QUFDOUIsd0NBQXdDO0FBQ3hDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUErQixDQUFDO0FBRS9GLG9GQUFvRjtBQUNwRiw0RUFBNEU7QUFDNUUsbUZBQW1GO0FBQ25GLDJFQUEyRTtBQUMzRSx1RkFBdUY7QUFDdkYsb0ZBQW9GO0FBQ3BGLHNGQUFzRjtBQUN0RixzRkFBc0Y7QUFDdEYsa0ZBQWtGO0FBQ2xGLGlEQUFpRDtBQUNqRCxPQUFPO0FBRVA7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sQ0FBQyxPQUFPLFVBQVUsYUFBYSxDQUNqQyxNQUE4QixFQUM5QixXQUFpRCxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztJQUNqQyxJQUFJLFlBQXFCLEVBQUUsYUFBc0IsRUFBRSxZQUFxQixFQUFFLEtBQWEsQ0FBQztJQUV4RixpQkFBaUIsQ0FBQyxVQUFVLEtBQUssRUFBRSxHQUFXO1FBQzFDLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsYUFBYSxHQUFHLFlBQVksSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFcEMsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNmLGdDQUFnQztZQUNoQywrRUFBK0U7WUFDL0UsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsS0FBSyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDZixLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFFRCxtREFBbUQ7WUFDbkQsS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxDQUFDIn0=