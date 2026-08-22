/**
 * @author Jeff Rose
 */
/**
 * A value that can be represented in JSON.
 */
export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;
/**
 * A JSON object value.
 */
export interface JSONObject extends Record<string, JSONValue> {
}
/**
 * A JSON array value.
 */
export interface JSONArray extends Array<JSONValue> {
}
/**
 * A value that can safely be converted to a string or JSON payload.
 */
export interface Serializable {
    toString(): string;
    toJSON?(): JSONValue;
}
/**
 * A value that can be serialized to JSON directly or through a `Serializable` contract.
 */
export type serializable = JSONValue | Serializable;
/**
 * Tests whether a value is a JSON array.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an array that survives a JSON round trip unchanged.
 */
export declare const isJSONArray: (value: any) => value is JSONArray;
/**
 * Tests whether a value is a JSON object.
 *
 * @param value - Value to test.
 * @returns `true` when the value is a non-primitive, non-array object that survives a JSON round trip unchanged.
 */
export declare const isJSONObject: (value: any) => value is JSONObject;
/**
 * Tests whether a value is directly representable in JSON.
 *
 * @param value - Value to test.
 * @returns `true` for JSON primitives, arrays, objects, and `null`.
 */
export declare const isJSONValue: (value: any) => value is JSONValue;
/**
 * Tests whether a value can be serialized using the `Serializable` contract.
 *
 * @param value - Value to test.
 * @returns `true` when the value is already JSON-compatible or exposes `toJSON()`/`toString()`.
 */
export declare const likeSerializable: (value: any) => boolean;
/**
 * Converts an arbitrary value into a JSON-safe representation.
 *
 * @param value - Value to serialize.
 * @returns A JSON-compatible value derived from the best available serialization strategy.
 */
export declare const serialize: (value: any) => JSONValue;
/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
