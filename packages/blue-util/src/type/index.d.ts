/**
 * @author Jeff Rose
 * @module type
 */
import isConstructor from './is-constructor.js';
import isFunction from './is-function.js';
import isNumber from './is-number.js';
import isNumeric from './is-numeric.js';
import isString from './is-string.js';
import isValidDate from './is-valid-date.js';
import like from './like.js';
import likeArray from './like-array.js';
import likePromise from './like-promise.js';
/**
 * Returns `true` if the specified object property is an instance of the
 * supplied constructor; `false` otherwise.
 *
 * @category Type
 * @param {Object} ctor The constructor to check against
 * @param {string} name The name of the property to check
 * @param {Object} obj The object to query
 * @returns {boolean}
 * @example
 * propIs( Number, 'x', { x: 1, y: 2 } ); //=> true
 * propIs( Number, 'x', { x: 'foo' } ); //=> false
 * propIs( Number, 'x', {} ); //=> false
 */
declare function propIs(ctor: any, name: string, obj: any): boolean;
/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @category Type
 * @param {*} val The value to test
 * @returns {string}
 * @example
 * type( {} ); //=> "Object"
 * type( 1 ); //=> "Number"
 * type( false ); //=> "Boolean"
 * type( 's' ); //=> "String"
 * type( null ); //=> "Null"
 * type( [] ); //=> "Array"
 * type( /[A-z]/ ); //=> "RegExp"
 * type( () => {} ); //=> "Function"
 * type( undefined ); //=> "Undefined"
 */
declare function type(val: any): string;
declare function is<T>(Ctor: any): (val: any) => val is T;
declare function is<T>(Ctor: any, val: any): val is T;
declare const isNil: (x: any) => x is null | undefined;
declare const isNotNil: <T>(x: T | null | undefined) => x is T;
/**
 * See if an object (`val`) is an instance of the supplied constructor. This
 * function will check up the inheritance chain, if any.
 *
 * @category Type
 * @param {Object} ctor A constructor
 * @param {*} val The value to test
 * @returns {boolean}
 * @example
 * is( Object, {} ); //=> true
 * is( Number, 1 ); //=> true
 * is( Object, 1 ); //=> false
 * is( String, 's' ); //=> true
 * is( String, new String('') ); //=> true
 * is( Object, new String('') ); //=> true
 * is( Object, 's' ); //=> false
 * is( Number, {} ); //=> false
 */
export { is };
/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @category Type
 * @param {*} x The value to test.
 * @returns {boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 * isNil( null ); //=> true
 * isNil( undefined ); //=> true
 * isNil( 0 ); //=> false
 * isNil( [] ); //=> false
 */
export { isNil };
/**
 * Checks if the input value is not `null` or `undefined`.
 *
 * @category Type
 * @param {*} x The value to test.
 * @returns {boolean} `false` if `x` is `undefined` or `null`, otherwise `true`.
 * @example
 * isNotNil( null ); //=> false
 * isNotNil( undefined ); //=> false
 * isNotNil( 0 ); //=> true
 * isNotNil( [] ); //=> true
 */
export { isNotNil };
/**
 * Returns `true` if the specified object property is an instance of the
 * supplied constructor; `false` otherwise.
 *
 * @category Type
 * @param {Object} ctor The constructor to check against
 * @param {string} name The name of the property to check
 * @param {Object} obj The object to query
 * @returns {boolean}
 * @example
 * propIs( Number, 'x', { x: 1, y: 2 } ); //=> true
 * propIs( Number, 'x', { x: 'foo' } ); //=> false
 * propIs( Number, 'x', {} ); //=> false
 */
export { propIs };
/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @category Type
 * @param {*} val The value to test
 * @returns {string}
 * @example
 * type( {} ); //=> "Object"
 * type( 1 ); //=> "Number"
 * type( false ); //=> "Boolean"
 * type( 's' ); //=> "String"
 * type( null ); //=> "Null"
 * type( [] ); //=> "Array"
 * type( /[A-z]/ ); //=> "RegExp"
 * type( () => {} ); //=> "Function"
 * type( undefined ); //=> "Undefined"
 */
export { type };
export { isConstructor, isFunction, isNumber, isNumeric, isString, isValidDate, like, likeArray, likePromise };
declare const _default: {
    is: typeof is;
    isConstructor: (value: any) => value is Function;
    isFunction: (value: any) => value is Function;
    isNil: (x: any) => x is null | undefined;
    isNotNil: <T>(x: T | null | undefined) => x is T;
    isNumber: (value: any) => value is number;
    isNumeric: (value: any) => value is import("./is-numeric.js").Numeric;
    isString: (value: any) => value is string;
    isValidDate: (value: any) => value is Date;
    like: typeof like;
    likeArray: (value: any) => value is ArrayLike<any>;
    likePromise: (value: any) => value is PromiseLike<any>;
    propIs: typeof propIs;
    type: typeof type;
};
export default _default;
