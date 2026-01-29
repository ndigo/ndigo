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
 * Checks if a value is an instance of a particular type.
 * @category Type
 * @param {*} ctor A constructor
 * @param {*} val The value to test
 * @returns {boolean}
 */
export { is };
/**
 * Checks if the input value is null or undefined.
 * @category Type
 * @param {*} x The value to test
 * @returns {boolean}
 */
export { isNil };
/**
 * Checks if the input value is not null or undefined.
 * @category Type
 * @param {*} x The value to test
 * @returns {boolean}
 */
export { isNotNil };
/**
 * Returns true if the specified object property is of the given type; false otherwise.
 * @category Type
 * @param {Function} type A constructor
 * @param {string} name Property name
 * @param {*} obj Object to test
 * @returns {boolean}
 */
export { propIs };
/**
 * Gives a single-word string description of the (native) type of a value.
 * @category Type
 * @param {*} val The value to test
 * @returns {string}
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