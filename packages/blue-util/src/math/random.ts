/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */

import alea from 'seedrandom/lib/alea.js';

function seed(): string {
    try {
        const values = new Uint8Array(256);

        // Try Web Crypto API (available in modern browsers and Node.js 15+)
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(values);
        } else {
            // Fallback to less secure random if no crypto implementation is available
            console.warn('No cryptographic implementation available, falling back to Math.random for seed.');
            for (let i = 0; i < 256; i++) {
                values[i] = Math.floor(Math.random() * 256);
            }
        }

        // Convert to base64 for compact representation
        if (typeof btoa !== 'undefined') {
            return btoa(String.fromCharCode(...values));
        }
        return Array.from(values, (v) => v.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn('Failed to generate cryptographic seed, using timestamp as fallback:', e);
        return `${Date.now()}-${Math.random()}`;
    }
}

/**
 * Generates a pseudo-random number.
 * @category Math
 * @returns {number} A pseudo-random number between `0` and `1`.
 * @example
 * random();
 * //=> 0.9282578795792454
 * random();
 * //=> 0.3752569768646784
 */
const random: () => number = alea(seed(), { entropy: true }).double;

export default random;
