/**
 * Secret-safe diagnostic redaction (SEC-11 / CF-2): a single helper every
 * error wrap that can echo a resolved property value uses, so a new wrap
 * point cannot silently reintroduce a plaintext leak (CTX-02/CTX-03).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * The placeholder substituted for any value when a secret decryptor is
 * configured — the value may be decrypted secret plaintext.
 */
export const REDACTED_VALUE = '<redacted>';

/**
 * Formats a resolved property value for a diagnostic (error) message.
 *
 * When a secret decryptor is configured, ANY value could be decrypted
 * plaintext, so the whole value is replaced by {@link REDACTED_VALUE}; the
 * surrounding message still names the key path, which is the useful part.
 * Without a decryptor the value is JSON-serialized unchanged.
 *
 * @param value - The resolved value to render.
 * @param secretContext - `true` when a decryptor is configured for the source.
 * @returns The diagnostic string.
 */
export function redactDiagnosticValue(value: unknown, secretContext: boolean): string {
    if (secretContext) return REDACTED_VALUE;
    return JSON.stringify(value);
}
