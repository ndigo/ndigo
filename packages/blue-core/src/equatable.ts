/**
 * @author Jeff Rose
 */

import { primitive, isPrimitive } from './primitive';
import { equals } from '@blue/util/relation';
import { like } from '@blue/util/types';

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
export const likeEquatable = like({ equals: Function }) as (value) => value is Equatable;

/**
 * Compares two values for equality. It handles `Equatable` objects, primitive types, and uses a general equality check for other types.
 * @param value1 - The first value to be tested.
 * @param value2 - The second value to be tested.
 * @returns `true` if the values are equal, `false` otherwise.
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
