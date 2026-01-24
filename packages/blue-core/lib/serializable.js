/**
 * @author Jeff Rose
 */
import { allPass, anyPass, both, complement, cond, equals, identity, invoker, map, mergeLeft, propIs, T, } from '@blue/util';
import { createNull } from './null';
import { isNotPrimitive } from './primitive';
/**
 * @typedef {external:boolean | external:number | external:string | module:core.JSONObject | module:core.JSONArray} module:core.JSONValue
 */
/**
 * @typedef {external:Record<external:string, module:core.JSONValue>} module:core.JSONObject
 */
/**
 * @typedef {external:Array<module:core.JSONValue>} module:core.JSONArray
 */
/**
 * @interface module:core.Serializable
 */
/**
 * @function module:core.Serializable#toJSON
 * @returns {module:core.JSONValue}
 */
/**
 * @function module:core.Serializable#toString
 * @returns {external:string}
 */
/**
 * @typedef {module:core.JSONValue | module:core.Serializable} module:core.serializable
 */
const { isArray } = Array, { parse, stringify } = JSON, hasFunction = propIs(Function), hasToJSON = hasFunction('toJSON'), hasToString = hasFunction('toString'), isNotArray = complement(isArray), toJSON = invoker(0, 'toJSON'), toString = invoker(0, 'toString'), _isJSONValue = (value) => equals(parse(stringify(value)), value);
/**
 * @function module:core.isJSONArray
 * @param {*} value
 * @returns {external:boolean}
 */
export const isJSONArray = both(isArray, _isJSONValue);
/**
 * @function module:core.isJSONObject
 * @param {*} value
 * @returns {external:boolean}
 */
export const isJSONObject = allPass([isNotPrimitive, isNotArray, _isJSONValue]);
/**
 * @function module:core.isJSONValue
 * @param {*} value
 * @returns {external:boolean}
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
 * @function module:core.likeSerializable
 * @param {*} value
 * @returns {external:boolean}
 */
export const likeSerializable = anyPass([isJSONValue, hasToJSON, hasToString]);
/**
 * @function module:core.serialize
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcmlhbGl6YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFDSCxPQUFPLEVBQ1AsT0FBTyxFQUNQLElBQUksRUFDSixVQUFVLEVBQ1YsSUFBSSxFQUNKLE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxFQUNQLEdBQUcsRUFDSCxTQUFTLEVBQ1QsTUFBTSxFQUNOLENBQUMsR0FDSixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFlN0M7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ3JCLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFDM0IsV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDOUIsU0FBUyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFDakMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDckMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDaEMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUF5QixFQUNyRCxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQXNCLEVBQ3RELFlBQVksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVyRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFrQyxDQUFDO0FBRXhGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBbUMsQ0FBQztBQUVsSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFzQixFQUFFO0lBQ3JELFFBQVEsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNuQixLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRO1lBQ1QsT0FBTyxJQUFJLENBQUM7UUFDaEIsS0FBSyxRQUFRO1lBQ1QsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRDtZQUNJLE9BQU8sS0FBSyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBcUMsQ0FBQztBQUVuSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7SUFDbkIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO0lBQ3ZCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQztJQUN2QixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0NBQy9CLENBQXlCLENBQUM7QUFFM0I7OztHQUdHIn0=