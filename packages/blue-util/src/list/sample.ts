/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import randInt from '../math/rand-int.js';

/**
 * @category List
 * @param {number} n The number of values to be sampled.
 * @param {ArrayLike} list The list from which values will be sampled.
 * @returns {Array} The sampled value(s).
 * @example
 * let list = [ "a", "b", "c" ];
 * sample( 2, list );
 * //=> [ "c", "a" ]
 * const sampleOne = sample( 1 );
 * sampleOne( list );
 * //=> [ "b" ]
 */
const sampleOne = <T = any>(list: ArrayLike<T>): T =>
    Array.prototype.splice.call(list, randInt(0, list.length - 1), 1)[0];

function sample<T = any>(n: number, list: ArrayLike<T>): T[];
function sample<T = any>(n: number): (list: ArrayLike<T>) => T[];
function sample<T = any>(n: number, list?: ArrayLike<T>): T[] | ((list: ArrayLike<T>) => T[]) {
    const impl = (l: ArrayLike<T>): T[] => {
        const length = l.length,
            result: T[] = [];

        let count = Math.max(Math.min(n, length), 1);

        while (count--) {
            result.push(sampleOne<T>(l));
        }

        return result;
    };

    if (arguments.length >= 2) {
        return impl(list!);
    }
    return impl;
}

export { sample };
