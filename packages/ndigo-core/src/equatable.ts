/**
 */
import { primitive } from './primitive.js';
import { like } from '@ndigo/util/types';

/**
 * Represents an object that can be compared for equality with another object of the same type.
 * @typeParam T - The type of the object being compared. Defaults to `unknown`.
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

interface Ancestors {
    left: Map<object, object>;
    right: Map<object, object>;
}

/** Selects enumerable own keys, plus all present array indices regardless of enumerability. */
const comparisonKeys = (value: object, arrayLength?: number): (string | symbol)[] => {
    return Reflect.ownKeys(value).filter((key) => {
        if (arrayLength !== undefined && typeof key === 'string') {
            const index = Number(key);
            if (Number.isInteger(index) && index >= 0 && index < arrayLength && String(index) === key) {
                return true;
            }
        }
        return Object.prototype.propertyIsEnumerable.call(value, key);
    });
};

const compare = (a: unknown, b: unknown, ancestors?: Ancestors): boolean => {
    if (a === null || (typeof a !== 'object' && typeof a !== 'function')) return a === b;
    if (b === null || (typeof b !== 'object' && typeof b !== 'function')) return false;

    // An active ancestor must match its corresponding ancestor, even when a === b.
    if (ancestors && (ancestors.left.has(a) || ancestors.right.has(b))) {
        return ancestors.left.get(a) === b && ancestors.right.get(b) === a;
    }

    const aEquatable = likeEquatable(a);
    const bEquatable = likeEquatable(b);
    if (aEquatable && bEquatable) return a.equals(b);
    if (aEquatable || bEquatable) return a === b;
    if (a === b && !ancestors) return true;
    if (typeof a === 'function' || typeof b === 'function') return a === b;

    const prototype = Object.getPrototypeOf(a);
    if (prototype !== Object.getPrototypeOf(b)) return false;

    if (prototype === Date.prototype) {
        return a === b || (a as Date).getTime() === (b as Date).getTime();
    }
    if (prototype === Set.prototype) {
        const left = a as Set<unknown>;
        const right = b as Set<unknown>;
        if (left.size !== right.size) return false;
        for (const value of left) {
            if (!right.has(value)) return false;
        }
        return true;
    }

    const isMap = prototype === Map.prototype;
    let keys: (string | symbol)[] | undefined;
    if (isMap) {
        const left = a as Map<unknown, unknown>;
        const right = b as Map<unknown, unknown>;
        if (left.size !== right.size) return false;
        if (left.size === 0) return true;
    } else {
        let arrayLength: number | undefined;
        if (prototype === Array.prototype) {
            if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
            arrayLength = a.length;
        } else if (Array.isArray(a) || Array.isArray(b)) {
            return a === b;
        } else if (prototype !== Object.prototype && prototype !== null) {
            return a === b;
        }
        keys = comparisonKeys(a, arrayLength);
        if (keys.length !== comparisonKeys(b, arrayLength).length) return false;
        for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
            if (!Object.prototype.propertyIsEnumerable.call(b, key)) {
                if (arrayLength === undefined || typeof key !== 'string') return false;
                const index = Number(key);
                if (!Number.isInteger(index) || index < 0 || index >= arrayLength || String(index) !== key) {
                    return false;
                }
            }
        }
        if (keys.length === 0) return true;
    }

    // Only recursive structural comparisons need tracking; primitive/domain paths do not.
    ancestors ??= { left: new Map(), right: new Map() };
    ancestors.left.set(a, b);
    ancestors.right.set(b, a);
    try {
        if (isMap) {
            const right = b as Map<unknown, unknown>;
            for (const [key, value] of a as Map<unknown, unknown>) {
                if (!right.has(key) || !compare(value, right.get(key), ancestors)) return false;
            }
        } else {
            const left = a as Record<string | symbol, unknown>;
            const right = b as Record<string | symbol, unknown>;
            // keys are only collected in this (non-map) branch; the guard is
            // unreachable but keeps the type narrow without an assertion.
            if (keys === undefined) return false;
            for (const key of keys) {
                if (!compare(left[key], right[key], ancestors)) return false;
            }
        }
        return true;
    } finally {
        ancestors.left.delete(a);
        ancestors.right.delete(b);
    }
};

/**
 * Compares arbitrary values using strict primitive equality (`NaN` is unequal; +/-0 are equal).
 * When both values expose `equals`, delegates to the left value, including for nested values.
 * When only one exposes `equals`, they are unequal unless they are the same reference.
 * Other identical references are equal. Distinct objects support only these domains:
 * - Plain records with Object.prototype or null prototype: matching prototypes and recursive
 *   comparison of own enumerable string and symbol properties.
 * - Arrays with Array.prototype: matching lengths, own index presence and recursive values
 *   (holes differ from undefined), plus own enumerable non-index properties.
 * - Dates with Date.prototype: equal timestamps (distinct invalid Dates are unequal).
 * - Maps with Map.prototype: native key identity/SameValueZero and recursive value equality.
 * - Sets with Set.prototype: native membership/SameValueZero, not structural member equality.
 * Date/Map/Set extra properties are ignored. Subclasses and all other object kinds, including
 * RegExp, WeakMap, WeakSet and Promise, are identity-only unless they expose `equals`.
 * Recursive comparisons match corresponding active ancestors, so matching cycles terminate
 * and different cycle structures are unequal; non-cyclic sharing does not affect equality.
 * @param value1 - The first value to be tested.
 * @param value2 - The second value to be tested.
 * @returns `true` if the values are equal, `false` otherwise.
 */
export const equates = (value1: unknown, value2: unknown): boolean => compare(value1, value2);
