/**
 * Generates cryptographically secure random tokens.
 */

import { assertCryptoAvailable } from './_crypto.js';

// RFC 4648 §5 base64url alphabet (URL- and filename-safe, `-` and `_`).
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Character codes for each 6-bit group emitted by the encoder. */
const BASE64URL_CHARS: ReadonlyArray<number> = Array.from(BASE64URL_ALPHABET, (ch) => ch.codePointAt(0) as number);

/**
 * Encodes `bytes` as unpadded base64url (RFC 4648 §5). Padding `=` characters
 * are omitted, matching Node's `Buffer#toString('base64url')` output so the
 * length relationship is identical for a given byte count.
 */
function base64urlNoPadding(bytes: Uint8Array): string {
    const length = bytes.length;
    const fullGroups = Math.floor(length / 3);
    const remainder = length % 3;
    const out = new Array<string>(Math.ceil((length * 4) / 3));
    let outIndex = 0;
    let byteIndex = 0;

    for (let group = 0; group < fullGroups; group++) {
        const a = bytes[byteIndex] as number;
        const b = bytes[byteIndex + 1] as number;
        const c = bytes[byteIndex + 2] as number;
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[a >> 2] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[((a & 0x03) << 4) | (b >> 4)] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[((b & 0x0f) << 2) | (c >> 6)] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[c & 0x3f] as number);
        byteIndex += 3;
    }

    if (remainder === 1) {
        const a = bytes[byteIndex] as number;
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[a >> 2] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[(a & 0x03) << 4] as number);
    } else if (remainder === 2) {
        const a = bytes[byteIndex] as number;
        const b = bytes[byteIndex + 1] as number;
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[a >> 2] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[((a & 0x03) << 4) | (b >> 4)] as number);
        out[outIndex++] = String.fromCharCode(BASE64URL_CHARS[(b & 0x0f) << 2] as number);
    }

    return out.join('');
}

/**
 * Generates a cryptographically secure random token of `bytes` length,
 * encoded as unpadded base64url (RFC 4648 §5).
 *
 * Backed by `globalThis.crypto.getRandomValues`, which is available in
 * Node.js 15+ and all modern browsers; throws if the Web Cryptography API is
 * unavailable (fail closed rather than degrade to an insecure PRNG).
 *
 * The output length is `ceil(bytes * 4 / 3)`, with no `=`, `+`, or `/`
 * characters. For a fixed byte count the encoding is identical to Node's
 * `Buffer#toString('base64url')`, so call sites can migrate without changing
 * token format.
 *
 * @param bytes - Number of random bytes to draw; must be a positive integer.
 * @returns A base64url string with no padding.
 * @throws If `bytes` is not a positive integer.
 * @throws If the Web Cryptography API is unavailable.
 *
 * @example
 * ```ts
 * randomToken(32); //=> 'U2xpoMkrQaQj2mZs6D4fJf9FmWP0nN1rQkzL7mBc3d8' (43 chars)
 * ```
 */
export function randomToken(bytes: number): string {
    if (!Number.isInteger(bytes) || bytes < 1) {
        throw new RangeError(`randomToken bytes must be a positive integer, got ${String(bytes)}`);
    }
    assertCryptoAvailable();
    const buffer = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(buffer);
    return base64urlNoPadding(buffer);
}

export default randomToken;
