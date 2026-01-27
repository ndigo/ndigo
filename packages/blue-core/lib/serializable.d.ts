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
 * @param {*} value
 * @returns {boolean}
 */
export declare const isJSONArray: (value: any) => value is JSONArray;
/**
 * @param {*} value
 * @returns {boolean}
 */
export declare const isJSONObject: (value: any) => value is JSONObject;
/**
 * @param {*} value
 * @returns {boolean}
 */
export declare const isJSONValue: (value: any) => value is JSONValue;
/**
 * @param {*} value
 * @returns {boolean}
 */
export declare const likeSerializable: (value: any) => value is serializable;
/**
 * @param {*} value
 * @returns {module:core.JSONValue}
 */
export declare const serialize: (value: any) => JSONValue;
/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
//# sourceMappingURL=serializable.d.ts.map