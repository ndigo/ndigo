/**
 * @author Jeff Rose
 */

import { primitive, isPrimitive } from './primitive';
import { equals, like } from '@blue/util';

export interface Equatable<T = any> {
    equals(value: T): boolean;
}

export type equatable = Equatable | primitive;

/**
 * @interface module:core.Equatable
 */

/**
 * @function module.core.Equatable#equal
 * @param {*} value
 * @returns {external:boolean}
 */

/**
 * @typedef {module:core.Equatable | modeule:core.primitive} module:core.equatable
 */

/**
 * @function module:core.likeEquatable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Equatable|Equatable}.
 */
export const likeEquatable = like({ equals: Function }) as (value) => value is Equatable;

/**
 * @function module:core.equates
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {external:Boolean} Whether or not the values are equal.
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
