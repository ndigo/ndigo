/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    jwtVerify,
    importSPKI,
    exportJWK,
    createLocalJWKSet,
    createRemoteJWKSet,
    JWTPayload,
    JWTVerifyGetKey,
} from 'jose';
import { type AuthAdapter } from '@blue/auth-core';
import { type Principal } from '@blue/auth-core';
import { type AuthResult } from '@blue/auth-core';

/**
 * Configuration for the JWT adapter.
 */
export interface JWTAdapterConfig {
    /** The issuer (iss) claim to validate. */
    issuer: string;
    /** The audience (aud) claim to validate. */
    audience: string;
    /** HMAC shared secret (HS256/HS384/HS512). Required when `algorithm` is an HS* alg. */
    secret?: string;
    /**
     * PEM-encoded public key (RS256/ES256/etc.). Required when `algorithm` is
     * an asymmetric alg and no `jwksUrl` is provided.
     */
    publicKey?: string;
    /**
     * JWKS endpoint URL (e.g. an OIDC provider's `jwks_uri`). When set, keys are
     * fetched + cached from this endpoint and rotated automatically, taking
     * precedence over `publicKey`.
     */
    jwksUrl?: string;
    /** The algorithm used for signing (e.g., 'HS256', 'RS256'). */
    algorithm: string;
}

/**
 * A reference implementation of {@link AuthAdapter} for JWT-based authentication.
 *
 * Uses `jose` for cryptographic signature verification:
 * - HMAC algorithms (HS256/HS384/HS512) via the shared `secret`
 * - Asymmetric algorithms (RS256/ES256/…) via a PEM `publicKey` or a JWKS
 *   endpoint (`jwksUrl`, auto-rotating + cached)
 *
 * Issuer, audience, and expiration are validated on every token.
 */
export class JWTAdapter implements AuthAdapter {
    readonly id = 'jwt';
    #config: JWTAdapterConfig;
    #localJwks: JWTVerifyGetKey | null = null;
    #remoteJwks: JWTVerifyGetKey | null = null;

    constructor(config: JWTAdapterConfig) {
        this.#config = config;
        if (config.jwksUrl) {
            this.#remoteJwks = createRemoteJWKSet(new URL(config.jwksUrl));
        }
    }

    /**
     * Lazily builds a local JWKS from the PEM public key.
     *
     * The PEM → CryptoKey → JWK → local JWKSet chain is the supported
     * verified-flow; passing a bare KeyObject to `jwtVerify` is rejected by
     * jose's `check_key_type` on Node 22.
     */
    async #getLocalJwks(): Promise<JWTVerifyGetKey> {
        if (this.#localJwks) {
            return this.#localJwks;
        }
        const { publicKey } = this.#config;
        if (!publicKey) {
            throw new Error('JWTAdapter: `publicKey` or `jwksUrl` is required for this algorithm');
        }
        const cryptoKey = await importSPKI(publicKey, this.#config.algorithm);
        const jwk = await exportJWK(cryptoKey);
        this.#localJwks = createLocalJWKSet({ keys: [jwk] });
        return this.#localJwks;
    }

    /**
     * Validates a JWT token and returns the associated principal.
     *
     * @remarks Verifies the signature cryptographically via `jose` for both
     * HMAC and asymmetric algorithms (RS256/ES256…), and enforces issuer,
     * audience, and expiration claims. Trailing whitespace and other spec
     * allowances are handled by `jose`.
     *
     * @param token - The JWT to validate.
     * @returns The authenticated {@link Principal}, or `null` if validation fails.
     */
    async validate(token: string): Promise<Principal | null> {
        try {
            const key = await this.#resolveKey();
            // jose's jwtVerify has separate overloads for a concrete key vs a
            // JWKS getKey function — pick the overload by runtime kind.
            const { payload } =
                typeof key === 'function'
                    ? await jwtVerify(token, key, this.#verifyOptions())
                    : await jwtVerify(token, key, this.#verifyOptions());

            return principalFromPayload(payload);
        } catch {
            return null;
        }
    }

    /**
     * The issuer/audience/algorithms options enforced on every token.
     */
    #verifyOptions(): {
        issuer: string;
        audience: string;
        algorithms: string[];
    } {
        return {
            issuer: this.#config.issuer,
            audience: this.#config.audience,
            algorithms: [this.#config.algorithm],
        };
    }

    /**
     * Resolves the verification key: remote JWKS, then local JWKS (PEM), then
     * the HMAC secret.
     */
    async #resolveKey(): Promise<Uint8Array | JWTVerifyGetKey> {
        if (this.#remoteJwks) {
            return this.#remoteJwks;
        }
        const algorithm = this.#config.algorithm;
        if (algorithm.startsWith('HS')) {
            return new TextEncoder().encode(this.#config.secret ?? '');
        }
        return this.#getLocalJwks();
    }

    async authenticate(_credentials: unknown): Promise<AuthResult> {
        // Credential validation is outside the scope of a JWT adapter.
        // Use an identity provider or database-backed auth flow.
        throw new Error('JWTAdapter.authenticate() not implemented - use a proper auth flow');
    }

    async refresh(_token: string): Promise<AuthResult> {
        throw new Error('JWTAdapter.refresh() not implemented - use a proper token refresh flow');
    }

    async logout(_token: string): Promise<void> {
        // Stateless JWT — logout is client-side token discard.
    }
}

/**
 * Maps verified JWT claims to a {@link Principal}.
 *
 * @param payload - The verified JWT payload.
 * @returns The principal.
 */
function principalFromPayload(payload: JWTPayload): Principal {
    const roles = Array.isArray(payload.roles) ? (payload.roles as unknown[]) : [];
    return {
        id: String(payload.sub ?? 'unknown'),
        name: String(payload.name ?? payload.email ?? 'Unknown'),
        roles: roles.map((r) => String(r)),
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...asked: string[]) => asked.some((r) => roles.includes(r)),
    };
}
