/**
 * @author Jeff Rose
 */
import { allPass, anyPass, both, complement, cond, equals, identity, invoker, map, mergeLeft, propIs, T, } from '@blue/util';
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
const { isArray } = Array, { parse, stringify } = JSON, hasFunction = propIs(Function), hasToJSON = hasFunction('toJSON'), hasToString = hasFunction('toString'), isNotArray = complement(isArray), toJSON = invoker(0, 'toJSON'), toString = invoker(0, 'toString'), _isJSONValue = (value) => equals(parse(stringify(value)), value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcmlhbGl6YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFDSCxPQUFPLEVBQ1AsT0FBTyxFQUNQLElBQUksRUFDSixVQUFVLEVBQ1YsSUFBSSxFQUNKLE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxFQUNQLEdBQUcsRUFDSCxTQUFTLEVBQ1QsTUFBTSxFQUNOLENBQUMsR0FDSixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFlN0M7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7R0FDRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ3JCLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFDM0IsV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDOUIsU0FBUyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFDakMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDckMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDaEMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUF5QixFQUNyRCxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQXNCLEVBQ3RELFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVyRTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQWtDLENBQUM7QUFFeEY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQW1DLENBQUM7QUFFbEg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFzQixFQUFFO0lBQ3JELFFBQVEsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNuQixLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRO1lBQ1QsT0FBTyxJQUFJLENBQUM7UUFDaEIsS0FBSyxRQUFRO1lBQ1QsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRDtZQUNJLE9BQU8sS0FBSyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFxQyxDQUFDO0FBRW5IOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO0lBQ25CLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQztJQUN2QixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7SUFDdkIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztDQUMvQixDQUF5QixDQUFDO0FBRTNCOzs7R0FHRyJ9