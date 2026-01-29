/**
 * @author Jeff Rose
 */

import { primitive, isPrimitive } from './primitive';
import { equals } from '@blue/util/relation';
import { like } from '@blue/util/types';

export interface Equatable<T = any> {
    equals(value: T): boolean;
}

export type equatable = Equatable | primitive;

/**
 */

/**
 * @param {*} value
 * @returns {boolean}
 */

/**
 * @typedef {module:core.Equatable | modeule:core.primitive} module:core.equatable
 */

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Equatable|Equatable}.
 */
export const likeEquatable = like({ equals: Function }) as (value) => value is Equatable;

/**
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {Boolean} Whether or not the values are equal.
 */
export const equates = (value1: equatable, value2: equatable): boolean => {
    if (likeEquatable(value1) && likeEquatable(value2)) {
        return value1.equals(value2);
    } else if (isPrimitive(value1) && isPrimitive(value2)) {
        return value1 === value2;
    } else {
        return equals(value1, value2);
    }
};
