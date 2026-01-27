/**
 * @author Jeff Rose
 */

import {
    allPass,
    anyPass,
    both,
    complement,
    cond,
    equals,
    identity,
    invoker,
    map,
    mergeLeft,
    propIs,
    T,
} from '@blue/util';
import { createNull } from './null';
import { isNotPrimitive } from './primitive';

export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;

export interface JSONObject extends Record<string, JSONValue> {}

export interface JSONArray extends Array<JSONValue> {}

export interface Serializable {
    toString(): string;
    toJSON?(): JSONValue;
}

export type serializable = JSONValue | Serializable;

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

const { isArray } = Array,
    { parse, stringify } = JSON,
    hasFunction = propIs(Function),
    hasToJSON = hasFunction('toJSON'),
    hasToString = hasFunction('toString'),
    isNotArray = complement(isArray),
    toJSON = invoker(0, 'toJSON') as (value) => JSONValue,
    toString = invoker(0, 'toString') as (value) => string,
    _isJSONValue = (value) => equals(parse(stringify(value)), value);

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isJSONArray = both(isArray, _isJSONValue) as (value) => value is JSONArray;

/**
 * @param {*} value
 * @returns {boolean}
 */
export const isJSONObject = allPass([isNotPrimitive, isNotArray, _isJSONValue]) as (value) => value is JSONObject;

/**
 * @param {*} value
 * @returns {boolean}
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
 * @param {*} value
 * @returns {boolean}
 */
export const likeSerializable = anyPass([isJSONValue, hasToJSON, hasToString]) as (value) => value is serializable;

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
]) as (value) => JSONValue;

/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
