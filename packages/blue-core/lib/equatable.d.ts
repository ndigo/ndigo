import { primitive } from './primitive';
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
export declare const likeEquatable: (value: any) => value is Equatable;
/**
 * @function module:core.equates
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {external:Boolean} Whether or not the values are equal.
 */
export declare const equates: (value1: equatable, value2: equatable) => boolean;
//# sourceMappingURL=equatable.d.ts.map