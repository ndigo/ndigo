/**
 * Property-shape guards shared by the JSON and iterable predicates.
 */
import { is } from '@ndigo/util/types';

/**
 * Builds a guard that tests whether an object's property has the given type.
 *
 * @param type - The constructor or primitive wrapper to match.
 * @returns A function taking the property name, then the value to test.
 *
 * @example
 * ```ts
 * const hasEntries = propIs(Function)('entries');
 * hasEntries(new Map()); // true
 * ```
 */
export const propIs =
    (type: Function) =>
    (name: string | symbol) =>
    (obj: unknown): boolean =>
        is(type, (obj as Record<PropertyKey, unknown> | undefined)?.[name]);

/**
 * Tests whether an object's property is a function.
 */
export const hasFunction = propIs(Function);
