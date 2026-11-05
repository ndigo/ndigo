/**
 * A JavaScript primitive value.
 *
 * @since 1.0.0
 * @author Jeff Rose
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
