/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://stackoverflow.com/questions/40922531/how-to-check-if-a-javascript-function-is-a-constructor}
 */

import { both, F, partial, pipe, T, tryCatch } from 'ramda';
import isFunction from './is-function';

const construct = partial(Reflect.construct, [String, []]),
    constructAndReturnTrue = pipe(construct, T);

/**
 * Determines whether a given value is a constructor, i.e. creates instances using `new`.
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a constructor.
 * @category Type
 */
const isConstructor = (value: any): value is Function =>
    both<any>(isFunction, tryCatch(constructAndReturnTrue, F))(value);

export default isConstructor;
