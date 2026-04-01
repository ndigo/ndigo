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
    propIs = (type) => (name) => (obj) => is(type, prop(name, obj)),
    hasFunction = propIs(Function),
    hasToJSON = hasFunction('toJSON'),
    hasToString = hasFunction('toString'),
    isNotArray = complement(isArray),
    toJSON = invoker(0, 'toJSON') as (value) => JSONValue,
    toString = invoker(0, 'toString') as (value) => string,
    _isJSONValue = (value) => equals(parse(stringify(value)), value);

/**
 * Tests whether a value is a JSON array.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an array that survives a JSON round trip unchanged.
 */
export const isJSONArray = both(isArray, _isJSONValue) as (value) => value is JSONArray;

/**
 * Tests whether a value is a JSON object.
 *
 * @param value - Value to test.
 * @returns `true` when the value is a non-primitive, non-array object that survives a JSON round trip unchanged.
 */
export const isJSONObject = allPass([isNotPrimitive, isNotArray, _isJSONValue]) as (value) => value is JSONObject;

/**
 * Tests whether a value is directly representable in JSON.
 *
 * @param value - Value to test.
 * @returns `true` for JSON primitives, arrays, objects, and `null`.
 */
export const isJSONValue = (value): value is JSONValue => {
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
 * Tests whether a value can be serialized using the `Serializable` contract.
 *
 * @param value - Value to test.
 * @returns `true` when the value is already JSON-compatible or exposes `toJSON()`/`toString()`.
 */
export const likeSerializable = anyPass([isJSONValue, hasToJSON, hasToString]) as (value) => value is serializable;

/**
 * Converts an arbitrary value into a JSON-safe representation.
 *
 * @param value - Value to serialize.
 * @returns A JSON-compatible value derived from the best available serialization strategy.
 */
export const serialize = cond([
    [hasToJSON, toJSON],
    [isJSONValue, identity],
    [hasToString, toString],
    [isArray, map((value) => serialize(value))],
    [T, mergeLeft(createNull())],
]) as (value) => JSONValue;

/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
