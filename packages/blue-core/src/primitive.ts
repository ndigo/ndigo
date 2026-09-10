/**
 * A JavaScript primitive value.
 *
 * Primitives are the values that are not objects and do not carry methods or state.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
export type primitive = boolean | null | number | string | symbol | bigint | undefined;

/**
 * Tests whether a value is a primitive.
 *
 * @param value - Value to test.
 * @returns `true` when the value is a primitive.
 * @see {@link primitive}
 */
export const isPrimitive = (value: unknown): value is primitive => {
    switch (typeof value) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'undefined':
            return true;
        case 'object':
            return value === null;
        default:
            return false;
    }
};

/**
 * Tests whether a value is not a primitive.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an object.
 * @see {@link primitive}
 */
export const isNotPrimitive = ((value: unknown) => !isPrimitive(value)) as (value: unknown) => value is object;
