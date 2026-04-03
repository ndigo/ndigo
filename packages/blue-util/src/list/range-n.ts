/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

const { abs, max } = Math;

/**
 * @category List
 * @param {number} step The amount by which the first number will be incremented or decremented.
 * @param {number} from The first number in the list.
 * @param {number} [to=from] One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.
 * @returns {Array} The list of numbers in the set `[a, b)` adjusted by the step amount.
 * @example
 * rangeN( 2, 0, 5 );
 * //=> [ 0, 2, 4 ]
 *
 * const rangeThree = rangeN( 3 );
 * rangeThree( 2, 10 );
 * //=> [ 2, 5, 8 ]
 * @see {@link range}
 */
function rangeN(step: number, from: number, to?: number): number[];
function rangeN(step: number): (from: number, to?: number) => number[];
function rangeN(step: number, from?: number, to?: number): number[] | ((from: number, to?: number) => number[]) {
    const impl = (f: number, t?: number): number[] => {
        if (t === void 0) {
            return [];
        }

        // fix negative zero
        let s = step === 0 ? 0 : step;
        if (f === 0) {
            f = 0;
        }
        if (t === 0) {
            t = 0;
        }

        s = max(abs(s), 1);

        const descending = f > t,
            result: number[] = [];

        while (descending ? f > t : f < t) {
            result.push(f);
            f = descending ? f - s : f + s;
        }

        return result;
    };

    if (arguments.length >= 2) {
        return impl(from!, to);
    }
    return impl;
}

export default rangeN;
