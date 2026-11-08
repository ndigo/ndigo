/**
 * Multi-scheme password encoder with a default scheme.
 */
import { type PasswordEncoder, schemePrefix, UnknownPasswordSchemeError } from './password-encoder';

/**
 * Multi-scheme {@link PasswordEncoder} that dispatches on the `{scheme}`
 * prefix of each hash (the `DelegatingPasswordEncoder` shape, without
 * the legacy `{noop}` fallthrough).
 *
 * - `encode` routes to the configured default scheme and wraps the result
 *   with its id: `{scrypt}$ln=17,r=8,p=1$…`.
 * - `verify` parses the prefix and delegates; an **unknown or missing
 *   scheme throws** (`UnknownPasswordSchemeError`) — loud fail-closed,
 *   never a silent `false`, never an accept-as-plaintext path.
 * - `needsRehash` is `true` for any non-default scheme, plus whatever the
 *   underlying scheme reports (cost-parameter drift) — the transparent
 *   migration hook: new logins rehash onto the default scheme.
 *
 * Usage:
 * ```ts
 * const encoder = new DelegatingPasswordEncoder(
 *     { scrypt: new ScryptPasswordEncoder() },
 *     'scrypt',
 * );
 * ```
 * Adding argon2id later (AD-33 D-3) is purely additive: register the
 * adapter under `'argon2id'`; old scrypt hashes keep verifying and
 * `needsRehash` migrates logins onto the new default.
 */
export class DelegatingPasswordEncoder implements PasswordEncoder {
    readonly #encoders: Readonly<Record<string, PasswordEncoder>>;
    readonly #defaultId: string;

    constructor(encoders: Readonly<Record<string, PasswordEncoder>>, defaultId: string) {
        if (!(defaultId in encoders)) {
            throw new UnknownPasswordSchemeError(`Default password scheme "{${defaultId}}" is not registered`);
        }
        this.#encoders = encoders;
        this.#defaultId = defaultId;
    }

    /**
     * Hashes with the default scheme, prefixing its id.
     *
     * @param rawPassword - The plaintext password.
     * @returns The `{scheme}`-prefixed hash.
     */
    encode(rawPassword: string): string {
        return `{${this.#defaultId}}${this.#encoders[this.#defaultId].encode(rawPassword)}`;
    }

    /**
     * Verifies against the hash's declared scheme.
     *
     * @param rawPassword - The plaintext password.
     * @param encodedPassword - The `{scheme}`-prefixed hash.
     * @returns Whether the password matches.
     */
    verify(rawPassword: string, encodedPassword: string): boolean {
        const { id, body } = this.#parse(encodedPassword);
        return this.#encoders[id].verify(rawPassword, body);
    }

    /**
     * Whether the hash's scheme or parameters are outdated.
     *
     * @param encodedPassword - The `{scheme}`-prefixed hash.
     * @returns Whether a rehash is recommended.
     */
    needsRehash(encodedPassword: string): boolean {
        const { id, body } = this.#parse(encodedPassword);
        if (id !== this.#defaultId) return true;
        return this.#encoders[id].needsRehash(body);
    }

    #parse(encodedPassword: string): { id: string; body: string } {
        const match = schemePrefix.exec(encodedPassword);
        if (!match) {
            throw new UnknownPasswordSchemeError('Missing scheme prefix: expected "{<scheme>}<encoded>"');
        }
        const [, id, body] = match;
        if (!(id in this.#encoders)) {
            throw new UnknownPasswordSchemeError(`Unknown password scheme "{${id}}"`);
        }
        return { id, body };
    }
}
