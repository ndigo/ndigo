/**
 * The password-encoder contract and scheme errors.
 */

/**
 * Error thrown when a password-hash string carries an unknown or malformed
 * scheme. Verification fails **loud** on unrecognized schemes (reference parity
 * Security 5.8+ parity): a silent `false` could hide a migration mistake
 * that locks users out — or, worse, a fallthrough that accepts a plaintext.
 *
 * @example
 * ```ts
 * const instance = new UnknownPasswordSchemeError();
 * ```
 */
export class UnknownPasswordSchemeError extends Error {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "UnknownPasswordSchemeError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object UnknownPasswordSchemeError]"
     */
    get [Symbol.toStringTag](): string {
        return 'UnknownPasswordSchemeError';
    }

    constructor(message: string) {
        super(message);
        this.name = 'UnknownPasswordSchemeError';
    }
}

/**
 * Verifies and produces self-describing password hashes.
 *
 * The contract follows the reference shape (encode + verify + rehash hook) with
 * Ndigo/JS names: `verify` not `matches` (`matches` is Ndigo vocabulary
 * for pattern matching; `verify` is the auth vocabulary — see the wrapped
 * `jose.jwtVerify`).
 *
 * Hash strings are **self-describing**: they carry their scheme and
 * parameters (`{scrypt}$ln=17,r=8,p=1$<salt>$<hash>` — PHC-style
 * serialization), so cost-parameter bumps never invalidate stored hashes
 * and `needsRehash` drives transparent migration at login time.
 *
 * Implementations MUST verify in constant time relative to the hash
 * (constant-time compare on the derived key) and MUST fail closed on
 * malformed input.
 *
 * Note: encoding/verification is CPU-bound synchronous work (scrypt,
 * ~100ms at default cost). Frame it behind rate limiting on credential
 * endpoints.
 *
 * @example
 * ```ts
 * const value = {} as PasswordEncoder;
 * ```
 */
export interface PasswordEncoder {
    /**
     * Hashes a raw password into a self-describing string.
     *
     * @param rawPassword - The plaintext password.
     * @returns The self-describing hash.
     */
    encode(rawPassword: string): string;

    /**
     * Returns `true` only when `rawPassword` derives to `encodedPassword`.
     * Never throws for a mismatch; fails loud (`UnknownPasswordSchemeError`)
     * on an unrecognized scheme.
     *
     * @param rawPassword - The plaintext password to verify.
     * @param encodedPassword - The stored self-describing hash.
     * @returns Whether the password matches.
     */
    verify(rawPassword: string, encodedPassword: string): boolean;

    /**
     * Returns `true` when the stored hash would not be produced by the
     * current configuration — a different scheme, or outdated cost
     * parameters/key length. Login flows rehash on `true` to migrate
     * stored hashes forward.
     *
     * @param encodedPassword - The stored hash to inspect.
     * @returns Whether a rehash is recommended.
     */
    needsRehash(encodedPassword: string): boolean;
}

/**
 * The `{scheme}rest` wrapper format: every hash produced through a
 * delegating encoder carries its scheme id as a leading `{id}` segment,
 * followed by the scheme's own self-describing body.
 */
export const schemePrefix = /^\{([^{}]+)\}([\s\S]+)$/;
