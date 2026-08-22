/**
 * @author Jeff Rose
 */
import { primitive } from './primitive.js';
/**
 * Represents an object that can be compared for equality with another object of the same type.
 * @template T - The type of the object being compared. Defaults to `any`.
 */
export interface Equatable<T = any> {
    /**
     * Determines if this object is equal to the specified value.
     * @param value - The value to compare with this object.
     * @returns `true` if the objects are equal, `false` otherwise.
     */
    equals(value: T): boolean;
}
/**
 * Represents a value that can be compared for equality, which can be either an `Equatable` object or a primitive type.
 */
export type equatable = Equatable | primitive;
/**
 * Type guard to check if a value implements the `Equatable` interface.
 * @param value - The value to be tested.
 * @returns `true` if the `value` is `Equatable`, `false` otherwise.
 */
export declare const likeEquatable: (value: unknown) => value is Equatable;
/**
 * Compares two values for equality. It handles `Equatable` objects, primitive types, and uses a general equality check for other types.
 * @param value1 - The first value to be tested.
 * @param value2 - The second value to be tested.
 * @returns `true` if the values are equal, `false` otherwise.
 */
export declare const equates: (value1: equatable, value2: equatable) => boolean;
