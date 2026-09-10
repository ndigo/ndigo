/**
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://stackoverflow.com/questions/40922531/how-to-check-if-a-javascript-function-is-a-constructor}
 */

import isFunction from './is-function.js';

/**
 * Determines whether a given value is a constructor, i.e. creates instances using `new`.
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a constructor.
 * @category Type
 */
const isConstructor = (value: unknown): value is Function => {
    if (!isFunction(value)) return false;

    try {
        Reflect.construct(String, [], value);
        return true;
    } catch {
        return false;
    }
};

export default isConstructor;
