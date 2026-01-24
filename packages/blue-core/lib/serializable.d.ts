/**
 * @author Jeff Rose
 */
export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;
export interface JSONObject extends Record<string, JSONValue> {
}
export interface JSONArray extends Array<JSONValue> {
}
export interface Serializable {
    toString(): string;
    toJSON?(): JSONValue;
}
export type serializable = JSONValue | Serializable;
/**
 * @function module:core.isJSONArray
 * @param {*} value
 * @returns {external:boolean}
 */
export declare const isJSONArray: (value: any) => value is JSONArray;
/**
 * @function module:core.isJSONObject
 * @param {*} value
 * @returns {external:boolean}
 */
export declare const isJSONObject: (value: any) => value is JSONObject;
/**
 * @function module:core.isJSONValue
 * @param {*} value
 * @returns {external:boolean}
 */
export declare const isJSONValue: (value: any) => value is JSONValue;
/**
 * @function module:core.likeSerializable
 * @param {*} value
 * @returns {external:boolean}
 */
export declare const likeSerializable: (value: any) => value is serializable;
/**
 * @function module:core.serialize
 * @param {*} value
 * @returns {module:core.JSONValue}
 */
export declare const serialize: (value: any) => JSONValue;
/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
//# sourceMappingURL=serializable.d.ts.map