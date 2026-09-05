/**
 * @author Jeff Rose
 */

import { is } from '@blue/util/types';
import { isNotPrimitive } from './primitive.js';

/**
 * A value that can be represented in JSON.
 */
export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;

/**
 * A JSON object value.
 */
export interface JSONObject extends Record<string, JSONValue> {}

/**
 * A JSON array value.
 */
export interface JSONArray extends Array<JSONValue> {}

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

const { isArray } = Array,
    { parse, stringify } = JSON,
    propIs = (type: any) => (name: any) => (obj: any) => is(type, obj?.[name]),
    hasFunction = propIs(Function),
    hasToJSON = hasFunction('toJSON'),
    hasToString = hasFunction('toString'),
    isNotArray = (value: unknown) => !isArray(value),
    _T = (): boolean => true,
    _deepEqual = (a: unknown, b: unknown): boolean => {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (typeof a !== 'object' || typeof b !== 'object') return false;
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        const keysA = Object.keys(a as object),
            keysB = Object.keys(b as object);
        if (keysA.length !== keysB.length) return false;
        return keysA.every((k) => _deepEqual((a as any)[k], (b as any)[k]));
    };

/**
 * Tests whether a value is a JSON array.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an array that survives a JSON round trip unchanged.
 */
export const isJSONArray = ((value: any) => isArray(value) && _deepEqual(parse(stringify(value)), value)) as (
    value: any
) => value is JSONArray;

/**
 * Tests whether a value is a JSON object.
 *
 * @param value - Value to test.
 * @returns `true` when the value is a non-primitive, non-array object that survives a JSON round trip unchanged.
 */
export const isJSONObject = ((value: any) =>
    isNotPrimitive(value) && isNotArray(value) && _deepEqual(parse(stringify(value)), value)) as (
    value: any
) => value is JSONObject;

/**
 * Tests whether a value is directly representable in JSON.
 *
 * @param value - Value to test.
 * @returns `true` for JSON primitives, arrays, objects, and `null`.
 */
export const isJSONValue = (value: any): value is JSONValue => {
    switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
            return true;
        case 'object':
            return value === null || _deepEqual(parse(stringify(value)), value);
        default:
            return false;
    }
};

/**
 * Tests whether a value can be serialized using the `Serializable` contract.
 *
 * @param value - Value to test.
 * @returns `true` when the value is already JSON-compatible or exposes `toJSON()`/`toString()`.
 */
export const likeSerializable = (value: any) => isJSONValue(value) || hasToJSON(value) || hasToString(value);

/**
 * Converts an arbitrary value into a JSON-safe representation.
 *
 * @param value - Value to serialize.
 * @returns A JSON-compatible value derived from the best available serialization strategy.
 */
export const serialize = (value: any): JSONValue => {
    if (hasToJSON(value)) return value.toJSON();
    if (isJSONValue(value)) return value;
    if (hasToString(value)) return value.toString();
    if (isArray(value)) return value.map((v) => serialize(v));
    return { ...value };
};

/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
