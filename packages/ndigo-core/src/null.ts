/**
 * An object with a `null` prototype.
 */
export class Null {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "Null".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object Null]"
     */
    get [Symbol.toStringTag](): string {
        return 'Null';
    }
}

Reflect.setPrototypeOf(Null.prototype, null);

/**
 * Creates a plain object whose prototype is `null`.
 *
 * @returns A new object without `Object.prototype` in its prototype chain.
 */
export const createNull = () => Object.create(null); // Force rebuild
