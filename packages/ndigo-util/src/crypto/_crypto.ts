/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Fails closed when Web Cryptography is unavailable. Shared by the crypto
 * helpers (`randomToken`, `randomHex`) so neither can silently degrade to a
 * predictable PRNG on a platform without `globalThis.crypto`.
 *
 * @throws {Error} If `globalThis.crypto.getRandomValues` is missing.
 */
export function assertCryptoAvailable(): void {
    if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function') {
        throw new Error('Web Cryptography (globalThis.crypto.getRandomValues) is required for crypto random helpers');
    }
}
