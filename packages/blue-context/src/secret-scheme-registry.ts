/**
 * Secret scheme registry — marker dispatch + wiring capability gate (AD-29 D-3).
 *
 * Registration is the wiring step: a cipher whose capabilities cannot honor
 * the full guarantee set is REFUSED here (throws), never silently wired with
 * a weaker guarantee. Decryption dispatches on the marker's scheme segment,
 * so mixed-scheme rotation works in one deployment.
 *
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from '@blue/core';
import { parseSecretMarker, SecretCipher, SecretDecryptContext, SecretDecryptor } from './secret-cipher';

/**
 * Registry mapping marker schemes to cipher backends.
 *
 * Instances are immutable-safe by construction: ciphers are registered once
 * at wiring time; `get` performs the dispatch lookup.
 */
export class SecretSchemeRegistry implements SecretDecryptor {
    #ciphers: Map<string, SecretCipher> = new Map<string, SecretCipher>();

    /**
     * The number of registered cipher schemes.
     */
    get size(): number {
        return this.#ciphers.size;
    }

    /**
     * Registers a cipher backend, enforcing the capability gate.
     *
     * A backend that cannot supply key-path AAD binding is refused with an
     * `IllegalStateError` naming the scheme — pluggability must never quietly
     * downgrade the threat model. Duplicate schemes replace (re-registration
     * wins), so rotating an implementation in place is a plain re-wire.
     *
     * @param cipher - The cipher backend to register.
     * @throws {IllegalStateError} When `cipher.capabilities.aad` is false.
     */
    register(cipher: SecretCipher): void {
        if (!cipher.capabilities?.aad) {
            throw new IllegalStateError(
                `Secret cipher "${cipher.scheme}" does not support AAD binding; refusing to wire ` +
                    '(AD-29 D-3 capability gate — pluggability must not downgrade the threat model)'
            );
        }
        this.#ciphers.set(cipher.scheme, cipher);
    }

    /**
     * Decrypts a raw resolved value by dispatching on its marker scheme.
     *
     * Values that are not well-formed secret markers pass through unchanged.
     * A marker whose scheme is not registered throws `IllegalStateError`
     * naming the scheme — never a plaintext fallback for something that
     * declares itself a secret.
     *
     * @param value - The resolved value (post-placeholder resolution).
     * @param context - The resolution context (key path, used as AAD).
     * @returns The decrypted value or the value passed through.
     * @throws {IllegalStateError} On unknown scheme, tamper, or wrong key.
     */
    decrypt(value: string, context: SecretDecryptContext): string {
        const marker = parseSecretMarker(value);
        if (!marker) return value;

        const cipher = this.#ciphers.get(marker.scheme);
        if (!cipher) {
            throw new IllegalStateError(
                `Secret marker references an unregistered scheme "${marker.scheme}" ` +
                    `(key "${context.key}"); registered schemes: ${this.#schemes()}. ` +
                    'Wiring a SecretCipher for the scheme is required — never a plaintext fallback.'
            );
        }
        return cipher.decrypt(value, context.key);
    }

    #schemes(): string {
        const names = [...this.#ciphers.keys()];
        return names.length ? names.join(', ') : '(none)';
    }
}
