/**
 * An object with a `null` prototype.
 */
export class Null {}

Reflect.setPrototypeOf(Null.prototype, null);

/**
 * Creates a plain object whose prototype is `null`.
 *
 * @returns A new object without `Object.prototype` in its prototype chain.
 */
export const createNull = () => Object.create(null); // Force rebuild
