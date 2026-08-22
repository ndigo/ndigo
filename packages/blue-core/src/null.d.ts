/**
 * @author Jeff Rose
 */
/**
 * An object with a `null` prototype.
 *
 * This is useful when you need a dictionary-like object without inherited members.
 */
export declare class Null {
}
/**
 * Creates a plain object whose prototype is `null`.
 *
 * @returns A new object without `Object.prototype` in its prototype chain.
 */
export declare const createNull: () => any;
