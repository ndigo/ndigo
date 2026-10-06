/**
 * @module blue-core
 * @since 1.0.0
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
    propIs =
        (type: Function) =>
        (name: string | symbol) =>
        (obj: unknown): boolean =>
            is(type, (obj as Record<PropertyKey, unknown> | undefined)?.[name]),
    hasFunction = propIs(Function),
    hasToJSON = hasFunction('toJSON'),
    hasToString = hasFunction('toString'),
    isNotArray = (value: unknown) => !isArray(value),
    _T = (): boolean => true,
    // `JSON.stringify` throws on cyclic structures and BigInt; a value that
    // cannot survive a JSON round trip is simply not a JSON value, so the
    // throw is folded into `false` rather than escaping the predicate.
    _jsonRoundTrips = (value: unknown): boolean => {
        try {
            return _deepEqual(parse(stringify(value)), value);
        } catch {
            return false;
        }
    },
    _deepEqual = (a: unknown, b: unknown): boolean => {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (typeof a !== 'object' || typeof b !== 'object') return false;
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        const aRecord = a as Record<string, unknown>,
            bRecord = b as Record<string, unknown>;
        const keysA = Object.keys(aRecord),
            keysB = Object.keys(bRecord);
        if (keysA.length !== keysB.length) return false;
        return keysA.every((k) => _deepEqual(aRecord[k], bRecord[k]));
    };

/**
 * Tests whether a value is a JSON array.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an array that survives a JSON round trip unchanged.
 */
export const isJSONArray = ((value: unknown) => isArray(value) && _jsonRoundTrips(value)) as (
    value: unknown
) => value is JSONArray;

/**
 * Tests whether a value is a JSON object.
 *
 * @param value - Value to test.
 * @returns `true` when the value is a non-primitive, non-array object that survives a JSON round trip unchanged.
 */
export const isJSONObject = ((value: unknown) =>
    isNotPrimitive(value) && isNotArray(value) && _jsonRoundTrips(value)) as (value: unknown) => value is JSONObject;

/**
 * Tests whether a value is directly representable in JSON.
 *
 * @param value - Value to test.
 * @returns `true` for JSON primitives, arrays, objects, and `null`.
 */
export const isJSONValue = (value: unknown): value is JSONValue => {
    switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
            return true;
        case 'object':
            return value === null || _jsonRoundTrips(value);
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
export const likeSerializable = (value: unknown) => isJSONValue(value) || hasToJSON(value) || hasToString(value);

/**
 * Converts an arbitrary value into a JSON-safe representation.
 *
 * @param value - Value to serialize.
 * @returns A JSON-compatible value derived from the best available serialization strategy.
 */
export const serialize = (value: unknown): JSONValue => {
    // `hasToJSON`/`hasToString` already established the shape; cast past the boolean predicate.
    if (hasToJSON(value)) return (value as { toJSON(): JSONValue }).toJSON();
    if (isJSONValue(value)) return value;
    // Arrays are recursed element-wise *before* the `toString` check — arrays
    // expose `toString`, so checking it first made this branch dead and
    // flattened any non-JSON array into its `"a,b"` string form.
    if (isArray(value)) return value.map((v) => serialize(v));
    if (hasToString(value)) return (value as { toString(): string }).toString();
    return { ...(value as object) } as JSONValue;
};

/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
