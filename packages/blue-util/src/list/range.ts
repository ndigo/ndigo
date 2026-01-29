/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import rangeN from './range-n.js';

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
 *
 * @category List
 * @param {number} from The first number in the list.
 * @param {number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @returns {Array} The list of numbers in the set `[a, b)`.
 * @example
 * range( 1 );
 * //=> []
 * range( 1, 1 );
 * //=> []
 * range( 1, 1.1 );
 * //=> [ 1 ]
 * range( 1, 5 );
 * //=> [ 1, 2, 3, 4 ]
 * range( 50, 53 );
 * //=> [ 50, 51, 52 ]
 * @see {@link rangeBy}
 */
export default rangeN(1) as (from: number, to?: number) => number[];
