/**
 * Secret-at-rest cipher contract and marker format (AD-29 D-3..D-5).
 *
 * Encrypted property values use a versioned, scheme-dispatched marker:
 *
 *   {cipher:v1:<base64url(iv | tag | ct)>}
 *
 * The first segment (`cipher`, `jwe`, `age`, `kms`) is the scheme id; the
 * optional second segment (`v1`) is the format version; the remainder is the
 * scheme-specific payload. A scheme registry dispatches decryption to the
 * registered implementation, so a deployment can mix markers (old `cipher:v1`
 * values + new `jwe` values during rotation) and swap backends without
 * touching configuration.
 *
 * Guarantees every implementation MUST provide (rides the interface, not the
 * implementation — an adapter that cannot honor the full set is refused at
 * wiring by the capability gate, never silently wired with a weaker
 * guarantee):
 *   - authenticated encryption (AEAD) — tamper → error, never plaintext
 *   - fail-loud on tamper / wrong key / unknown scheme or version
 *   - no plaintext fallback for anything claiming to be a secret
 *   - AAD binding (key-path AAD) required (`capabilities.aad === true`)
 *
 * Threat model (see the plan §1.1): this defends READ-ONLY access to stored
 * artifacts (repo, backups, logs) by separating ciphertext (in the file)
 * from the key (in a privileged channel). It does NOT defend against full
 * host compromise or code execution — the marker version prefix is the
 * documented migration seam to a KMS-envelope backend.
 *
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';

/**
 * Caps the marker's scheme segment (`cipher`, `jwe`, `age`, `kms`, …):
 * lowercase ASCII alphanumerics, first char a letter.
 */
const schemeRe = /^[a-z][a-z0-9]*$/;

/**
 * Caps the marker's version segment (`v1`, `v2`, `2026.1`, …): lowercase
 * alphanumerics, first char a letter (metadata free-form).
 */
const versionRe = /^[a-z][a-z0-9.]*$/;

/**
 * A parsed secret marker.
 */
export interface SecretMarker {
    /**
     * The scheme id (`cipher`, `jwe`, …) — dispatch key into the scheme registry.
     */
    readonly scheme: string;
    /**
     * The format version (`v1`), or `null` when the scheme carries none.
     */
    readonly version: string | null;
    /**
     * The scheme-specific payload (everything after scheme[:version]:).
     */
    readonly payload: string;
}

/**
 * Parses a secret marker in `{scheme[:version]:payload}` form.
 *
 * Returns `null` for any string that is not in marker form — such values
 * pass through the decrypt path untouched. A marker that IS in marker form
 * but has a malformed version segment (e.g. `{cipher:1:payload}`, where the
 * version must be letter-first like `v1`) throws a {@link FrameworkError}
 * instead of being silently folded into the payload. A marker with an
 * unknown scheme / version is the caller's business: decryption fails loud
 * there.
 *
 * @param value - The candidate marker string.
 *
 * The marker shape is RESERVED: any plaintext value that happens to match
 * `{scheme[:version]:...}` (e.g. `{en: hello}`) is treated as a marker and
 * fails loud at lookup when the scheme is not registered — config values
 * that look like markers cannot coexist with a wired decryptor.
 * @returns The parsed marker, or `null` when not in marker form.
 */
export function parseSecretMarker(value: string): SecretMarker | null {
    if (typeof value !== 'string' || value.length < 4 || value[0] !== '{' || !value.endsWith('}')) {
        return null;
    }
    const inner = value.slice(1, -1);
    const firstColon = inner.indexOf(':');
    if (firstColon === -1) return null;
    const scheme = inner.slice(0, firstColon);
    if (!schemeRe.test(scheme)) return null;
    const rest = inner.slice(firstColon + 1);
    if (rest.length === 0) return null;

    const secondColon = rest.indexOf(':');
    if (secondColon === -1) {
        return { scheme, version: null, payload: rest };
    }
    const version = rest.slice(0, secondColon);
    // A segment after `scheme:` claims to be the version, so it must be
    // well-formed: lowercase alphanumerics with a letter first (`v1`,
    // `2026.1`, …). A non-conforming segment (e.g. numeric `1`) is a
    // malformed marker — fail loud rather than silently folding `1:` into
    // the payload and misinterpreting the intended format.
    if (!versionRe.test(version)) {
        throw new FrameworkError(`Malformed secret marker: version segment must start with a letter (${version})`);
    }
    return { scheme, version, payload: rest.slice(secondColon + 1) };
}

/**
 * Non-throwing shape test for a marker-like string.
 *
 * Unlike {@link parseSecretMarker}, this NEVER throws: it answers only
 * "does this string look like a `{scheme:...}` marker?" — including malformed
 * markers whose version segment is invalid. It exists so the fail-open path
 * (no decryptor configured) can warn about a marker-shaped value without a
 * malformed marker turning an ordinary read into a failure (SEC-10 fail-open
 * contract, CTX-04).
 *
 * @param value - The candidate string.
 * @returns `true` when the value has the reserved `{scheme:...}` shape.
 */
export function isSecretMarkerLike(value: unknown): boolean {
    if (typeof value !== 'string' || value.length < 4 || value[0] !== '{' || !value.endsWith('}')) {
        return false;
    }
    const inner = value.slice(1, -1);
    const firstColon = inner.indexOf(':');
    if (firstColon === -1) return false;
    return schemeRe.test(inner.slice(0, firstColon));
}

/**
 * Capability flags a cipher backend may declare.
 */
export interface SecretCipherCapabilities {
    /**
     * Whether the backend supports additional authenticated data (AAD).
     * The decrypt path REQUIRES AAD binding (key-path AAD, AD-29 D-4); a
     * backend without it must be refused at wiring, never downgraded.
     * Compact JWE and age have no AAD slot — a hypothetical adapter for
     * them must return `false` here and be rejected by the capability gate.
     */
    readonly aad: boolean;
}

/**
 * A secret-at-rest cipher backend (AD-29 D-3/D-4).
 *
 * Implementations are identified by their {@link SecretCipher#scheme} —
 * the marker's dispatch key. The contract is intentionally narrow:
 * `encrypt(plain, aad?) → marker`, `decrypt(marker, aad?) → plain`.
 */
export interface SecretCipher {
    /**
     * The scheme id dispatched on markers (`cipher`, `jwe`, `age`, `kms`).
     */
    readonly scheme: string;
    /**
     * Capabilities for the wiring capability gate.
     */
    readonly capabilities: SecretCipherCapabilities;
    /**
     * Encrypts a plaintext value into a secret marker.
     *
     * @param plain - The plaintext value.
     * @param aad - Optional additional authenticated data (the key path).
     * @returns The versioned secret marker to store in configuration.
     */
    encrypt(plain: string, aad?: string): string;
    /**
     * Decrypts a secret marker back to plaintext.
     *
     * @param marker - The stored marker (`{scheme[:version]:payload}`).
     * @param aad - The additional authenticated data the value was bound to.
     * @returns The plaintext value.
     * @throws {IllegalStateError} On tamper, wrong key, or unknown scheme/version.
     */
    decrypt(marker: string, aad?: string): string;
}

/**
 * Context passed to a {@link SecretDecryptor} for each resolved value.
 */
export interface SecretDecryptContext {
    /**
     * The key path the value was resolved under (`db.password`) — the AAD
     * binding (ciphertext moved between key paths fails auth at lookup).
     */
    readonly key: string;
}

/**
 * Decrypts raw resolved values against a scheme registry.
 *
 * Implementations are injected into the property resolver (`ResolverOptions
 * .secretDecryptor`) and consulted for every string value after placeholder
 * resolution. Values that are not well-formed markers pass through unchanged;
 * marker values with an unknown scheme fail loud (never plaintext fallback).
 */
export interface SecretDecryptor {
    /**
     * Decrypts one resolved value.
     *
     * @param value - The resolved value (post-placeholder).
     * @param context - The resolution context (key path for AAD).
     * @returns The decrypted value, or the value unchanged when not a marker.
     */
    decrypt(value: string, context: SecretDecryptContext): string;
}
