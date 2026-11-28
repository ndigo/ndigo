/**
 * JWT key resolution, verification options, and signing.
 */
import {
    SignJWT,
    createLocalJWKSet,
    createRemoteJWKSet,
    exportJWK,
    importSPKI,
    type JWTVerifyGetKey,
    type JWTVerifyOptions,
} from 'jose';
import { FrameworkError } from '@ndigo/core';
import { JWTTokenError, type JWTAdapterConfig } from './jwt-adapter-types.js';

/** Minimum HMAC secret size in UTF-8 bytes (256 bits, matching SHA-256's block security). */
const MIN_HMAC_SECRET_BYTES = 32;

/**
 * Owns the adapter's verification keys and signing configuration.
 *
 * The local JWKS is built lazily from the configured PEM; the remote JWKS is
 * created once in the constructor and rotates through jose's cache.
 */
export class JWTKeyResolver {
    readonly #config: JWTAdapterConfig;
    #localJwks: JWTVerifyGetKey | null = null;
    readonly #remoteJwks: JWTVerifyGetKey | null;

    constructor(config: JWTAdapterConfig) {
        this.#config = config;
        if (config.algorithm.startsWith('HS')) {
            if (!config.secret) {
                throw new JWTTokenError(
                    `JWTAdapter: HMAC algorithm "${config.algorithm}" requires "secret" — validation and issuance fail without it`
                );
            }
            // HMAC security is bounded by the key's entropy; a short
            // secret is brute-forceable offline from a single signed token.
            const secretBytes = new TextEncoder().encode(config.secret).length;
            if (secretBytes < MIN_HMAC_SECRET_BYTES) {
                throw new JWTTokenError(
                    `JWTAdapter: HMAC algorithm "${config.algorithm}" requires a "secret" of at least ` +
                        `${MIN_HMAC_SECRET_BYTES} bytes (256 bits); got ${secretBytes} bytes`
                );
            }
        }
        this.#remoteJwks = config.jwksUrl ? createRemoteJWKSet(new URL(config.jwksUrl)) : null;
    }

    /**
     * The claims, issuer, audience, and algorithm options enforced on every
     * token. `requiredClaims` turns an absent `exp` (or `sub`) into a
     * verification failure instead of an unvalidated token.
     */
    verifyOptions(): JWTVerifyOptions {
        return {
            issuer: this.#config.issuer,
            audience: this.#config.audience,
            algorithms: [this.#config.algorithm],
            requiredClaims: ['exp', 'sub'],
            clockTolerance: this.#config.clockToleranceSeconds ?? 0,
        };
    }

    /**
     * Resolves the verification key: remote JWKS, then local JWKS (PEM), then
     * the HMAC secret.
     */
    async resolve(): Promise<Uint8Array | JWTVerifyGetKey> {
        if (this.#remoteJwks) {
            return this.#remoteJwks;
        }
        const algorithm = this.#config.algorithm;
        if (algorithm.startsWith('HS')) {
            return new TextEncoder().encode(this.#config.secret ?? '');
        }
        return this.#getLocalJwks();
    }

    /** Returns the HMAC signing key, rejecting asymmetric configurations. */
    signingSecret(): Uint8Array {
        const algorithm = this.#config.algorithm;
        if (!algorithm.startsWith('HS') || !this.#config.secret) {
            throw new JWTTokenError(
                `Token issuance requires an HMAC secret (HS* algorithms); "${algorithm}" holds no signing key`
            );
        }
        return new TextEncoder().encode(this.#config.secret);
    }

    /** Signs a payload with the adapter's issuer/audience and algorithm. */
    async sign(payload: Record<string, unknown>, expiresAtMs: number): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: this.#config.algorithm })
            .setIssuer(this.#config.issuer)
            .setAudience(this.#config.audience)
            .setIssuedAt(Math.floor(Date.now() / 1000))
            .setExpirationTime(Math.floor(expiresAtMs / 1000))
            .sign(this.signingSecret());
    }

    /**
     * Lazily builds a local JWKS from the PEM public key.
     *
     * The PEM → CryptoKey → JWK → local JWKSet chain is the supported
     * verified flow; passing a bare KeyObject to `jwtVerify` is rejected by
     * jose's `check_key_type` on Node 22.
     */
    async #getLocalJwks(): Promise<JWTVerifyGetKey> {
        if (this.#localJwks) {
            return this.#localJwks;
        }
        const { publicKey } = this.#config;
        if (!publicKey) {
            throw new FrameworkError('JWTAdapter: `publicKey` or `jwksUrl` is required for this algorithm');
        }
        const cryptoKey = await importSPKI(publicKey, this.#config.algorithm);
        const jwk = await exportJWK(cryptoKey);
        this.#localJwks = createLocalJWKSet({ keys: [jwk] });
        return this.#localJwks;
    }
}
