/**
 * OIDC discovery resolution and ID-token verification.
 */
import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from 'jose';
import { OIDCError, type DiscoveryDocument, type OIDCAdapterConfig } from './oidc-types.js';
import { assertTrustedUrl } from './_oidc-helpers.js';
import { fetchOidcJson } from './_oidc-http.js';
import { DEFAULT_ALLOWED_ALGORITHMS } from './_oidc-constants.js';

/**
 * Resolves discovery metadata and verifies ID tokens via JWKS or a
 * configured validator. Verification is mandatory.
 */
export class OIDCVerifier {
    readonly #config: OIDCAdapterConfig;
    readonly #discoveryUrl: string;
    #discoveryPromise: Promise<DiscoveryDocument> | null = null;
    #jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

    /**
     * @param config - The adapter configuration.
     */
    constructor(config: OIDCAdapterConfig) {
        this.#config = config;
        this.#discoveryUrl = `${config.issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
    }

    /** The required audience for ID tokens (`audience` or `clientId`). */
    get #audience(): string {
        return this.#config.audience ?? this.#config.clientId;
    }

    /**
     * Fetches, validates, and caches the discovery document. Validates that
     * the document's `issuer` matches the configured issuer exactly and that
     * advertised endpoints are HTTPS (loopback exempt).
     *
     * @returns The validated discovery document.
     */
    async ensureDiscovery(): Promise<DiscoveryDocument> {
        if (!this.#config.discovery) {
            throw new OIDCError('configuration', 'discovery is not enabled for this adapter');
        }
        if (this.#discoveryPromise === null) {
            this.#discoveryPromise = this.#fetchDiscovery().catch((error) => {
                this.#discoveryPromise = null;
                throw error;
            });
        }
        return this.#discoveryPromise;
    }

    /**
     * Full ID-token verification: structural decode, claim checks, then
     * signature verification via JWKS or the configured validator.
     *
     * @param token - The ID token.
     * @param expectedNonce - The nonce to enforce, or `null`.
     * @returns The verified payload.
     */
    async verifyIdToken(token: string, expectedNonce: string | null): Promise<JWTPayload> {
        let payload: JWTPayload;
        try {
            payload = decodeJwt(token);
        } catch (error) {
            throw new OIDCError('malformed_token', 'ID token is not a decodable JWT', { cause: error });
        }
        this.#assertClaims(payload, expectedNonce);

        const validator = this.#config.tokenValidator;
        if (validator) {
            const valid = await validator(token, payload as Record<string, unknown>);
            if (!valid) {
                throw new OIDCError('invalid_token', 'ID token signature validation failed');
            }
            return payload;
        }

        const jwks = await this.#resolveJwsVerification();
        // A custom validator returns above; without one the resolver throws when
        // no JWKS source exists, so this guard never fires for configured sources.
        if (!jwks) {
            throw new OIDCError('configuration', 'No JWKS source available for token verification');
        }
        const algorithms = this.#config.allowedAlgorithms ?? [...DEFAULT_ALLOWED_ALGORITHMS];
        try {
            const { payload: verified } = await jwtVerify(token, jwks, {
                issuer: this.#config.issuer,
                audience: this.#audience,
                algorithms,
            });
            return verified;
        } catch (error) {
            throw new OIDCError('invalid_token', 'ID token signature validation failed', { cause: error });
        }
    }

    async #fetchDiscovery(): Promise<DiscoveryDocument> {
        const raw = await fetchOidcJson(this.#config, new URL(this.#discoveryUrl), 'discovery document');
        if (typeof raw !== 'object' || raw === null) {
            throw new OIDCError('discovery', 'Discovery document is not a JSON object');
        }
        const doc = raw as Record<string, unknown>;
        if (doc.issuer !== this.#config.issuer) {
            throw new OIDCError('discovery', 'Discovery document issuer does not match the configured issuer');
        }
        return {
            issuer: this.#config.issuer,
            authorizationEndpoint: this.#assertTrustedEndpoint(doc.authorization_endpoint, 'authorization_endpoint'),
            tokenEndpoint: this.#assertTrustedEndpoint(doc.token_endpoint, 'token_endpoint'),
            jwksUri: doc.jwks_uri === undefined ? null : this.#assertTrustedEndpoint(doc.jwks_uri, 'jwks_uri'),
            endSessionEndpoint:
                doc.end_session_endpoint === undefined
                    ? null
                    : this.#assertTrustedEndpoint(doc.end_session_endpoint, 'end_session_endpoint'),
        };
    }

    #assertTrustedEndpoint(value: unknown, label: string): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new OIDCError('discovery', `Discovery document is missing a valid ${label}`);
        }
        let url: URL;
        try {
            url = new URL(value);
        } catch (error) {
            throw new OIDCError('discovery', `Discovery document has an invalid ${label}: ${value}`, { cause: error });
        }
        assertTrustedUrl(url, `discovery ${label}`);
        return value;
    }

    /** Resolves the JWKS source, from discovery when enabled. */
    async #resolveJwksUrl(): Promise<string | null> {
        if (this.#config.jwksUrl) return this.#config.jwksUrl;
        if (this.#config.discovery) {
            const doc = await this.ensureDiscovery();
            if (doc.jwksUri) return doc.jwksUri;
        }
        return null;
    }

    /** The effective signature verifier, or null when a custom validator is configured. */
    async #resolveJwsVerification(): Promise<ReturnType<typeof createRemoteJWKSet> | null> {
        if (this.#config.tokenValidator) return null;
        const jwksUrl = await this.#resolveJwksUrl();
        if (!jwksUrl) {
            throw new OIDCError('configuration', 'No JWKS source available for token verification');
        }
        this.#jwks ??= createRemoteJWKSet(new URL(jwksUrl));
        return this.#jwks;
    }

    /** Claim-level validation shared by every verification path. */
    #assertClaims(payload: JWTPayload, expectedNonce: string | null): void {
        if (payload.iss !== this.#config.issuer) {
            throw new OIDCError('invalid_token', 'ID token issuer does not match the configured issuer');
        }
        const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        if (!audiences.includes(this.#audience)) {
            throw new OIDCError('invalid_token', 'ID token audience does not match the configured audience');
        }
        if (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== this.#config.clientId) {
            throw new OIDCError('invalid_token', 'ID token azp does not match the client ID');
        }
        if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
            throw new OIDCError('invalid_token', 'ID token is missing a non-empty subject (sub) claim');
        }
        const now = Date.now() / 1000;
        const skew = 60;
        if (typeof payload.exp !== 'number' || payload.exp + skew < now) {
            throw new OIDCError('invalid_token', 'ID token is expired or missing exp');
        }
        if (payload.nbf !== undefined && (typeof payload.nbf !== 'number' || payload.nbf - skew > now)) {
            throw new OIDCError('invalid_token', 'ID token is not yet valid');
        }
        if (expectedNonce !== null && payload.nonce !== expectedNonce) {
            throw new OIDCError('invalid_nonce', 'ID token nonce does not match the authorization request');
        }
    }
}
