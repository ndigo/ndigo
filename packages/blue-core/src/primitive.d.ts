/**
 * @author Jeff Rose
 */
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
export declare const isPrimitive: (value: any) => value is primitive;
/**
 * Tests whether a value is not a primitive.
 *
 * @param value - Value to test.
 * @returns `true` when the value is an object.
 * @see {@link primitive}
 */
export declare const isNotPrimitive: (value: unknown) => value is object;
