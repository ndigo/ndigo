/**
 * @author Jeff Rose
 * @module type
 */
import { is, isNil, isNotNil, propIs, type } from 'ramda';
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
    isNil: typeof isNil;
    isNotNil: typeof isNotNil;
    isNumber: (value: any) => value is number;
    isNumeric: (value: any) => value is import("./is-numeric.js").Numeric;
    isString: (value: any) => value is string;
    isValidDate: (value: any) => value is Date;
    like: {
        (descriptor: import("./like.js").LikeDescriptor, value: any): boolean;
        (descriptor: import("./like.js").LikeDescriptor): (value: any) => boolean;
    };
    likeArray: (value: any) => value is ArrayLike<any>;
    likePromise: (value: any) => value is PromiseLike<any>;
    propIs: typeof propIs;
    type: typeof type;
};
export default _default;
//# sourceMappingURL=index.d.ts.map