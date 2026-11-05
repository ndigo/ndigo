/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { type PasswordEncoder, schemePrefix, UnknownPasswordSchemeError } from './password-encoder';

/**
 * Configuration for {@link ScryptPasswordEncoder}.
 *
 * Cost parameters are serialized into every hash, so a deployment can bump
 * them and rely on `needsRehash` to migrate stored hashes at login time.
 */
export interface ScryptOptions {
    /**
     * scrypt CPU/memory cost exponent: `N = 2 ** ln`. Default `17`
     * (`N = 131072`, ~128 MiB, the OWASP-recommended floor).
     * Must be a positive integer.
     */
    ln?: number;
    /**
     * Block-size parameter `r`. Default `8`. Must be a positive integer.
     */
    r?: number;
    /**
     * Parallelization parameter `p`. Default `1`. Must be a positive integer.
     */
    p?: number;
    /**
     * Derived-key length in bytes. Default `32`. Must be a positive integer.
     */
    keyLength?: number;
    /**
     * Per-user salt length in bytes. Default `16` (128 bits). Must be a
     * positive integer.
     */
    saltBytes?: number;
}

const DEFAULT_LN = 17;
const DEFAULT_R = 8;
const DEFAULT_P = 1;
const DEFAULT_KEY_LENGTH = 32;
const DEFAULT_SALT_BYTES = 16;

/** Matches `$ln=<int>,r=<int>,p=<int>$<base64url salt>$<base64url hash>`. */
const phcForm = /^\$ln=(\d+),r=(\d+),p=(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/;

/**
 * Caps for cost parameters decoded from a stored hash. The format embeds
 * `ln`/`r`/`p` so a deployment can bump cost and migrate at login — which
 * also makes them attacker-influenceable wherever a stored hash can be
 * poisoned. scrypt cost is exponential in `ln` and memory scales with
 * `r * 2**ln`; without caps an inflated `$ln=30,…` string OOMs the server
 * on the next verification (SEC-1, 2026-09-27 review).
 */
const MAX_LN = 18;
const MAX_R = 16;
const MAX_P = 4;
const MAX_SALT_BYTES = 64;
const MAX_KEY_LENGTH = 64;

/**
 * The reference {@link PasswordEncoder} implementation: scrypt via
 * `node:crypto` — a platform-audited primitive, zero dependencies (the
 * same reasoning that picked AES-GCM for `{cipher:...}`, AD-29).
 *
 * Serialization is PHC-style with **parameters embedded** in the string:
 * `$ln=17,r=8,p=1$<salt>$<hash>`. Verification parses the stored
 * parameters, so older hashes keep verifying after a cost bump.
 * Argon2id is a documented future alternative implementation (AD-33 D-3);
 * the self-describing format keeps adding it purely additive.
 *
 * Security properties:
 * - per-user 16-byte random salt (`randomBytes`);
 * - constant-time derived-key comparison (`timingSafeEqual`);
 * - malformed strings throw `UnknownPasswordSchemeError` — never a silent
 *   `false` that could mask a bad migration.
 */
export class ScryptPasswordEncoder implements PasswordEncoder {
    readonly #ln: number;
    readonly #r: number;
    readonly #p: number;
    readonly #keyLength: number;
    readonly #saltBytes: number;

    constructor(options: ScryptOptions = {}) {
        this.#ln = validatePositiveInt(options.ln ?? DEFAULT_LN, 'ln');
        this.#r = validatePositiveInt(options.r ?? DEFAULT_R, 'r');
        this.#p = validatePositiveInt(options.p ?? DEFAULT_P, 'p');
        this.#keyLength = validatePositiveInt(options.keyLength ?? DEFAULT_KEY_LENGTH, 'keyLength');
        this.#saltBytes = validatePositiveInt(options.saltBytes ?? DEFAULT_SALT_BYTES, 'saltBytes');
    }

    encode(rawPassword: string): string {
        const salt = randomBytes(this.#saltBytes);
        const derived = this.#derive(rawPassword, salt, {
            ln: this.#ln,
            r: this.#r,
            p: this.#p,
            keyLength: this.#keyLength,
        });
        return (
            `$ln=${this.#ln},r=${this.#r},p=${this.#p}$` +
            `${salt.toString('base64url')}$${derived.toString('base64url')}`
        );
    }

    verify(rawPassword: string, encodedPassword: string): boolean {
        const parsed = this.#parse(encodedPassword);
        try {
            const derived = this.#derive(rawPassword, parsed.salt, {
                ln: parsed.ln,
                r: parsed.r,
                p: parsed.p,
                keyLength: parsed.hash.length,
            });
            if (derived.length !== parsed.hash.length) return false;
            return timingSafeEqual(derived, parsed.hash);
        } catch {
            return false;
        }
    }

    needsRehash(encodedPassword: string): boolean {
        const parsed = this.#parse(encodedPassword);
        return (
            parsed.ln !== this.#ln ||
            parsed.r !== this.#r ||
            parsed.p !== this.#p ||
            parsed.hash.length !== this.#keyLength
        );
    }

    #derive(
        rawPassword: string,
        salt: Buffer,
        params: { ln: number; r: number; p: number; keyLength: number }
    ): Buffer {
        return scryptSync(rawPassword, salt, params.keyLength, {
            N: 2 ** params.ln,
            r: params.r,
            p: params.p,
            // Node's default maxmem (32 MiB) rejects the recommended cost;
            // the memory requirement is 128*r*N bytes — allow twice that.
            maxmem: 128 * params.r * 2 ** params.ln * 2,
        });
    }

    #parse(encodedPassword: string): { ln: number; r: number; p: number; salt: Buffer; hash: Buffer } {
        const scheme = schemePrefix.exec(encodedPassword);
        const body = scheme ? scheme[2] : encodedPassword;
        const match = phcForm.exec(body);
        if (!match) {
            throw new UnknownPasswordSchemeError(
                `Malformed scrypt hash: expected "$ln=<int>,r=<int>,p=<int>$<salt>$<hash>"`
            );
        }
        const [, ln, r, p, salt, hash] = match;
        const parsed = {
            ln: Number(ln),
            r: Number(r),
            p: Number(p),
            salt: Buffer.from(salt, 'base64url'),
            hash: Buffer.from(hash, 'base64url'),
        };
        if (
            parsed.ln > MAX_LN ||
            parsed.r > MAX_R ||
            parsed.p > MAX_P ||
            parsed.salt.length > MAX_SALT_BYTES ||
            parsed.hash.length > MAX_KEY_LENGTH
        ) {
            throw new UnknownPasswordSchemeError(
                `scrypt hash parameters out of range: ` +
                    `ln<=${MAX_LN}, r<=${MAX_R}, p<=${MAX_P}, salt<=${MAX_SALT_BYTES}B, key<=${MAX_KEY_LENGTH}B`
            );
        }
        return parsed;
    }
}

function validatePositiveInt(value: number, name: string): number {
    if (!Number.isInteger(value) || value < 1) {
        throw new RangeError(`ScryptPasswordEncoder option "${name}" must be a positive integer, got ${value}`);
    }
    return value;
}
