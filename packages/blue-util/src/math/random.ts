/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */

import alea from 'seedrandom/lib/alea';

function seed(): string {
    try {
        const values = new Uint8Array(256);
        
        // Try Web Crypto API first
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(values);
        } 
        // Try Node.js crypto
        else if (typeof require !== 'undefined') {
            const nodeCrypto = require('crypto');
            nodeCrypto.randomFillSync(values);
        }
        else {
            throw new Error('No crypto implementation available');
        }
        
        // Convert to base64 for compact representation
        return btoa(String.fromCharCode(...values));
    } catch (e) {
        console.warn('Failed to generate cryptographic seed, using timestamp:', e);
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
