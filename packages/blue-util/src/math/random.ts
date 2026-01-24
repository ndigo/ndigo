/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */

import alea from 'seedrandom/lib/alea';

function seed(): string {
    try {
        const values = new Uint8Array(256);
        crypto.getRandomValues(values);
        return String.fromCharCode.apply(0, values);
    } catch (e) {
        return String(Date.now);
    }
}

/**
 * Generates a pseudo-random number.
 * @function module:util.random
 * @category Math
 * @returns {external:number} A pseudo-random number between `0` and `1`.
 * @example
 * random();
 * //=> 0.9282578795792454
 * random();
 * //=> 0.3752569768646784
 */
const random: () => number = alea(seed(), { entropy: true }).double;

export default random;
