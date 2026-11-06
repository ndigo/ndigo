/**
 * Generates cryptographically secure random hex strings.
 */
import { assertCryptoAvailable } from './_crypto.js';

/** Lowercase hex digit per 4-bit nibble. */
const HEX_DIGITS = '0123456789abcdef';

/**
 * Generates a cryptographically secure random lowercase hex string of
 * `byteLength` bytes — 2 hex characters per byte.
 *
 * Backed by `globalThis.crypto.getRandomValues` (Node.js 15+, all modern
 * browsers) with the same fail-closed contract as {@link "random-token".randomToken | randomToken}: if
 * Web Cryptography is unavailable it throws instead of degrading to an
 * insecure PRNG. Use it for collision-resistant filenames, request ids, and
 * other non-secret unique names; use {@link "random-token".randomToken | randomToken} when the value is a
 * secret that benefits from base64url's entropy per character.
 *
 * @param byteLength - Number of random bytes to draw; must be a positive integer.
 * @returns A lowercase hex string of `byteLength * 2` characters.
 * @throws If `byteLength` is not a positive integer.
 * @throws If the Web Cryptography API is unavailable.
 *
 * @example
 * ```ts
 * randomHex(8); //=> 'a3f09c12de45b7e8' (16 chars)
 * ```
 */
export function randomHex(byteLength: number): string {
    if (!Number.isInteger(byteLength) || byteLength < 1) {
        throw new RangeError(`randomHex byteLength must be a positive integer, got ${String(byteLength)}`);
    }
    assertCryptoAvailable();
    const bytes = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(bytes);

    let hex = '';
    for (const byte of bytes) {
        hex += HEX_DIGITS.charAt(byte >> 4) + HEX_DIGITS.charAt(byte & 0x0f);
    }
    return hex;
}

export default randomHex;
