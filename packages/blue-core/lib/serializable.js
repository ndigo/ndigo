/**
 * @author Jeff Rose
 */
import { identity, invoker, T } from '@blue/util/function';
import { map } from '@blue/util/list';
import { allPass, anyPass, both, complement, cond } from '@blue/util/logic';
import { mergeLeft, prop } from '@blue/util/object';
import { equals } from '@blue/util/relation';
import { is } from '@blue/util/types';
import { createNull } from './null';
import { isNotPrimitive } from './primitive';
/**
 * @typedef {boolean | external:number | external:string | module:core.JSONObject | module:core.JSONArray} module:core.JSONValue
 */
/**
 * @typedef {Record<external:string, module:core.JSONValue>} module:core.JSONObject
 */
/**
 * @typedef {Array<module:core.JSONValue>} module:core.JSONArray
 */
/**
 */
/**
 * @returns {module:core.JSONValue}
 */
/**
 * @returns {string}
 */
/**
 * @typedef {module:core.JSONValue | module:core.Serializable} module:core.serializable
 */
const { isArray } = Array, { parse, stringify } = JSON, propIs = (type) => (name) => (obj) => is(type, prop(name, obj)), hasFunction = propIs(Function), hasToJSON = hasFunction('toJSON'), hasToString = hasFunction('toString'), isNotArray = complement(isArray), toJSON = invoker(0, 'toJSON'), toString = invoker(0, 'toString'), _isJSONValue = (value) => equals(parse(stringify(value)), value);
/**
 * @param {*} value
 * @returns {boolean}
 */
export const isJSONArray = both(isArray, _isJSONValue);
/**
 * @param {*} value
 * @returns {boolean}
 */
export const isJSONObject = allPass([isNotPrimitive, isNotArray, _isJSONValue]);
/**
 * @param {*} value
 * @returns {boolean}
 */
export const isJSONValue = (value) => {
    switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
            return true;
        case 'object':
            return value === null || _isJSONValue(value);
        default:
            return false;
    }
};
/**
 * @param {*} value
 * @returns {boolean}
 */
export const likeSerializable = anyPass([isJSONValue, hasToJSON, hasToString]);
/**
 * @param {*} value
 * @returns {module:core.JSONValue}
 */
export const serialize = cond([
    [hasToJSON, toJSON],
    [isJSONValue, identity],
    [hasToString, toString],
    [isArray, map((value) => serialize(value))],
    [T, mergeLeft(createNull())],
]);
/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcmlhbGl6YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN0QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFlN0M7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7R0FDRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ3JCLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFDM0IsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUMvRCxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUM5QixTQUFTLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUNqQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUNyQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUNoQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQXlCLEVBQ3JELFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBc0IsRUFDdEQsWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRXJFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBa0MsQ0FBQztBQUV4Rjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBbUMsQ0FBQztBQUVsSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLEVBQXNCLEVBQUU7SUFDckQsUUFBUSxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ25CLEtBQUssU0FBUyxDQUFDO1FBQ2YsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFFBQVE7WUFDVCxPQUFPLElBQUksQ0FBQztRQUNoQixLQUFLLFFBQVE7WUFDVCxPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pEO1lBQ0ksT0FBTyxLQUFLLENBQUM7SUFDckIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQXFDLENBQUM7QUFFbkg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7SUFDbkIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO0lBQ3ZCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQztJQUN2QixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0NBQy9CLENBQXlCLENBQUM7QUFFM0I7OztHQUdHIn0=