/**
 * Type guards and duck-typing predicates.
 */
import isFunction from './is-function.js';
import isNumber from './is-number.js';
import isString from './is-string.js';
import like from './like.js';

function is<T>(Ctor: Function): (val: unknown) => val is T;
function is<T>(Ctor: Function, val: unknown): val is T;
function is<T>(Ctor: Function, val?: unknown): ((v: unknown) => v is T) | boolean {
    if (arguments.length === 1) {
        return (v: unknown): v is T => v != null && (v.constructor === Ctor || v instanceof Ctor);
    }

    return val != null && (val.constructor === Ctor || val instanceof Ctor);
}

const isNil = (x: unknown): x is null | undefined => x == null;

const isNotNil = <T>(x: T | null | undefined): x is T => x != null;

/**
 * See if an object (`val`) is an instance of the supplied constructor. This
 * function will check up the inheritance chain, if any.
 *
 * @param ctor - A constructor.
 * @param val - The value to test.
 * @returns Whether `val` is an instance of `ctor`.
 *
 * @example
 * ```ts
 * is(Object, {}); //=> true
 * is(Number, 1); //=> true
 * is(Object, 1); //=> false
 * is(String, 's'); //=> true
 * is(String, new String('')); //=> true
 * is(Object, new String('')); //=> true
 * is(Object, 's'); //=> false
 * is(Number, {}); //=> false
 * ```
 */
export { is };

/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @param x - The value to test.
 * @returns `true` if `x` is `undefined` or `null`, otherwise `false`.
 *
 * @example
 * ```ts
 * isNil(null); //=> true
 * isNil(undefined); //=> true
 * isNil(0); //=> false
 * isNil([]); //=> false
 * ```
 */
export { isNil };

/**
 * Checks if the input value is not `null` or `undefined`.
 *
 * @param x - The value to test.
 * @returns `false` if `x` is `undefined` or `null`, otherwise `true`.
 *
 * @example
 * ```ts
 * isNotNil(null); //=> false
 * isNotNil(undefined); //=> false
 * isNotNil(0); //=> true
 * isNotNil([]); //=> true
 * ```
 */
export { isNotNil };

export { isFunction, isNumber, isString, like };
