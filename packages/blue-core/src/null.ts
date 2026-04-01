/**
 * @author Jeff Rose
 */

/**
 * An object with a `null` prototype.
 *
 * This is useful when you need a dictionary-like object without inherited members.
 */
export class Null {}
Reflect.setPrototypeOf(Null.prototype, null);

/**
 * Creates a plain object whose prototype is `null`.
 *
 * @returns A new object without `Object.prototype` in its prototype chain.
 */
export const createNull = Object.create.bind(Object, null);
