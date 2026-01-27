/**
 * @author Jeff Rose
 */
import { primitive } from './primitive';
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
export declare const likeEquatable: (value: any) => value is Equatable;
/**
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {Boolean} Whether or not the values are equal.
 */
export declare const equates: (value1: equatable, value2: equatable) => boolean;
//# sourceMappingURL=equatable.d.ts.map