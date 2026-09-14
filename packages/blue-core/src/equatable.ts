/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { primitive, isPrimitive } from './primitive.js';
import { like } from '@blue/util/types';

/**
 * Represents an object that can be compared for equality with another object of the same type.
 * @template T - The type of the object being compared. Defaults to `unknown`.
 */
export interface Equatable<T = unknown> {
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
export const likeEquatable = like({ equals: Function }) as (value: unknown) => value is Equatable;

/**
 * Performs a deep equality check between two values.
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns `true` if the values are equal, `false` otherwise
 */
const _deepEqual = (a: unknown, b: unknown): boolean => {
    // Handle primitive values and null/undefined
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    // Handle arrays
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
        const bArray = b as unknown[];
        if (a.length !== bArray.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!_deepEqual(a[i], bArray[i])) return false;
        }
        return true;
    }

    // Handle objects
    const aObject = a as Record<string, unknown>,
        bObject = b as Record<string, unknown>;
    const keysA = Object.keys(aObject),
        keysB = Object.keys(bObject);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!(key in bObject)) return false;
        if (!_deepEqual(aObject[key], bObject[key])) return false;
    }

    return true;
};

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
        // Deep equality fallback for complex objects
        return _deepEqual(value1, value2);
    }
};
