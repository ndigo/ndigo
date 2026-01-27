/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { curry } from 'ramda';
import randInt from '../math/rand-int';

type SampleFunction = {
    <T = any>(n: number, list: ArrayLike<T>): T[];
    <T = any>(n: number): (list: ArrayLike<T>) => T[];
};

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
        Array.prototype.splice.call(list, randInt(0, list.length - 1), 1)[0],
    sample: SampleFunction = curry(<T = any>(n: number, list: ArrayLike<T>): T[] => {
        const length = list.length,
            result: T[] = [];

        n = Math.max(Math.min(n, length), 1);

        while (n--) {
            result.push(sampleOne<T>(list));
        }

        return result;
    });

export default sample;
