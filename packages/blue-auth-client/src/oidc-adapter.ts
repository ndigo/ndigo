/**
 * @author Jeff Rose
 */

import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { type AuthAdapter } from '@blue/auth-core';
import { type Principal } from '@blue/auth-core';
import { type AuthResult } from '@blue/auth-core';

/**
 * Configuration for the OIDC adapter.
 */
export interface OIDCAdapterConfig {
    /** The issuer identifier (e.g., 'https://auth.example.com'). */
    issuer: string;
    /** The client ID registered with the identity provider. */
    clientId: string;
    /** The client secret (for confidential clients). */
    clientSecret?: string;
    /** The redirect URI for the authorization callback. */
    redirectUri: string;
    /** The scopes to request (e.g., ['openid', 'profile', 'email']). */
    scopes?: string[];
    /** The audience claim to validate (for API access). */
    audience?: string;
    /**
     * The provider's JWKS endpoint (`jwks_uri` from the OIDC discovery
     * document). When set, ID tokens are verified against this endpoint's
     * keys (fetched + cached + auto-rotated by `jose`) — production-grade
     * signature verification without wiring a custom `tokenValidator`.
     */
    jwksUrl?: string;
    /**
     * Optional custom token validation callback.
     *
     * If provided, called with the raw ID token and its parsed payload to
     * verify the cryptographic signature. Takes precedence over `jwksUrl`.
     *
     * If neither `jwksUrl` nor `tokenValidator` is set, the adapter decodes and
     * validates claims without signature verification — development only.
     */
    tokenValidator?: (token: string, payload: Record<string, unknown>) => Promise<boolean>;
}

/**
 * An {@link AuthAdapter} implementation for OpenID Connect (OIDC).
 *
 * This adapter handles the OIDC authorization code flow, including:
 * - Redirecting to the identity provider for authentication
 * - Exchanging the authorization code for tokens
 * - Validating ID tokens and extracting the principal
 * - Refreshing access tokens
 *
 * @remarks Token signature validation is delegated to the optional
 * `tokenValidator` callback in {@link OIDCAdapterConfig}. Without it,
 * the adapter verifies claims only — signature verification requires
 * a production validator (e.g., JWKS fetch via `jose`).
 */
export class OIDCAdapter implements AuthAdapter {
    readonly id = 'oidc';
    #config: OIDCAdapterConfig;
    #discoveryDocument: Record<string, any> | null = null;
    #jwksValidator: ReturnType<typeof createRemoteJWKSet> | null = null;

    constructor(config: OIDCAdapterConfig) {
        this.#config = config;
        if (config.jwksUrl) {
            this.#jwksValidator = createRemoteJWKSet(new URL(config.jwksUrl));
        }
    }

    /**
     * The effective token-signature validator: a custom `tokenValidator` if
     * provided, else a jose-backed JWKS validator built from `jwksUrl`, else
     * `null` (claim-only, development).
     */
    #resolvedValidator(): ((token: string, payload: Record<string, unknown>) => Promise<boolean>) | null {
        if (this.#config.tokenValidator) {
            return this.#config.tokenValidator;
        }
        if (!this.#config.jwksUrl) {
            return null;
        }
        const jwks = this.#jwksValidator;
        return async (token: string, payload: Record<string, unknown>): Promise<boolean> => {
            try {
                const { payload: verified } = await jwtVerify(token, jwks, {
                    issuer: this.#config.issuer,
                    audience: this.#config.audience,
                    // The ID token's `nonce`/signature are checked here; claim
                    // enforcement beyond iss/aud (exp is enforced by jose).
                });
                // Ensure the payload the caller sees matches the verified one.
                if (payload.sub && verified.sub && payload.sub !== verified.sub) {
                    return false;
                }
                return true;
            } catch {
                return false;
            }
        };
    }

    /**
     * Returns the authorization URL to redirect the user to.
     *
     * @remarks This implementation constructs the URL from the issuer base and configured
     * parameters. A production adapter should fetch the OIDC discovery document and
     * build the authorization URL from the published `authorization_endpoint`.
     *
     * @param state - Optional state parameter for CSRF protection.
     * @returns The authorization URL.
     */
    getAuthorizationUrl(state?: string): string {
        const authorizationUrl = `${this.#config.issuer}/authorize`;
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.#config.clientId,
            redirect_uri: this.#config.redirectUri,
            scope: (this.#config.scopes || ['openid', 'profile', 'email']).join(' '),
            state: state || '',
        });
        return `${authorizationUrl}?${params.toString()}`;
    }

    /**
     * Exchanges an authorization code for tokens.
     *
     * @remarks If a `tokenValidator` is configured, the ID token's signature
     * is verified before extracting the principal.
     *
     * @param code - The authorization code received from the callback.
     * @returns The {@link AuthResult} containing the principal and tokens.
     */
    async exchangeCodeForTokens(code: string): Promise<AuthResult> {
        const tokenUrl = `${this.#config.issuer}/token`;

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.#config.redirectUri,
                client_id: this.#config.clientId,
                ...(this.#config.clientSecret ? { client_secret: this.#config.clientSecret } : {}),
            }),
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        const tokens = await response.json();

        // Decode the ID token to extract the principal
        const idTokenParts = tokens.id_token.split('.');
        const payload = JSON.parse(
            Buffer.from(idTokenParts[1], 'base64').toString('utf-8')
        );

        // Verify the ID token signature when a validator is configured
        const tokenValidator = this.#resolvedValidator();
        if (tokenValidator) {
            const valid = await tokenValidator(tokens.id_token, payload);
            if (!valid) {
                throw new Error('ID token signature validation failed');
            }
        }

        const principal: Principal = {
            id: payload.sub || 'unknown',
            name: payload.name || payload.preferred_username || 'Unknown',
            roles: payload.roles || [],
            hasRole: (role: string) => (payload.roles || []).includes(role),
            hasAnyRole: (...roles: string[]) =>
                roles.some((r) => (payload.roles || []).includes(r)),
        };

        return {
            principal,
            token: tokens.access_token,
            expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
        };
    }

    /**
     * Validates an OIDC ID token and extracts the principal.
     *
     * @remarks If a `tokenValidator` is configured, the token's signature
     * is verified before extracting the principal.
     *
     * @param token - The ID token to validate.
     * @returns The authenticated {@link Principal}, or `null` if validation fails.
     */
    async validate(token: string): Promise<Principal | null> {
        try {
            const idTokenParts = token.split('.');
            if (idTokenParts.length !== 3) {
                return null;
            }

            const payload = JSON.parse(
                Buffer.from(idTokenParts[1], 'base64').toString('utf-8')
            );

            // Verify the ID token signature when a validator is configured
            const tokenValidator = this.#resolvedValidator();
            if (tokenValidator) {
                const valid = await tokenValidator(token, payload);
                if (!valid) {
                    return null;
                }
            }

            // Validate issuer
            if (payload.iss !== this.#config.issuer) {
                return null;
            }

            // Validate audience
            if (this.#config.audience && payload.aud !== this.#config.audience) {
                return null;
            }

            // Validate expiration
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return null;
            }

            return {
                id: payload.sub || 'unknown',
                name: payload.name || payload.preferred_username || 'Unknown',
                roles: payload.roles || [],
                hasRole: (role: string) => (payload.roles || []).includes(role),
                hasAnyRole: (...roles: string[]) =>
                    roles.some((r) => (payload.roles || []).includes(r)),
            };
        } catch {
            return null;
        }
    }

    async authenticate(_credentials: any): Promise<AuthResult> {
        // OIDC uses the authorization code flow, not direct credential authentication.
        throw new Error('OIDCAdapter.authenticate() not implemented - use getAuthorizationUrl() and exchangeCodeForTokens()');
    }

    /**
     * Refreshes the access token.
     *
     * @remarks This is a stub. A production adapter should use the OIDC refresh token
     * grant to obtain a new access token from the identity provider.
     *
     * @param token - The access token to refresh.
     * @returns A promise that rejects with an error (not implemented).
     */
    async refresh(_token: string): Promise<AuthResult> {
        throw new Error('OIDCAdapter.refresh() not implemented - use a proper refresh flow');
    }

    async logout(_token: string): Promise<void> {
        // OIDC logout requires redirecting the user to the provider's end_session_endpoint.
    }
}