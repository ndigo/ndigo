/**
 * OIDC authorization-code, token-exchange, and refresh flows.
 */
import { randomToken } from '@ndigo/util';
import {
    OIDCError,
    type AuthorizationRequest,
    type OIDCAdapterConfig,
    type OIDCResult,
    type PendingAuthorizationStore,
    type RefreshTokenStore,
    type TokenResponse,
} from './oidc-types.js';
import { InMemoryPendingAuthorizationStore, InMemoryRefreshTokenStore } from './oidc-stores.js';
import { fetchOidcJson } from './_oidc-http.js';
import { hashRefreshToken, pkceCodeChallenge, principalFromPayload } from './_oidc-helpers.js';
import { CODE_VERIFIER_BYTES, DEFAULT_AUTHORIZATION_TTL_MS } from './_oidc-constants.js';
import type { OIDCVerifier } from './_oidc-verifier.js';

/**
 * Runs the OIDC authorization-code (PKCE) and refresh-token grants against
 * a verifier and the configured pending/refresh stores.
 */
export class OIDCTokenFlow {
    readonly #config: OIDCAdapterConfig;
    readonly #verifier: OIDCVerifier;
    readonly #pending: PendingAuthorizationStore;
    readonly #refresh: RefreshTokenStore;
    readonly #refreshInFlight = new Map<string, Promise<OIDCResult>>();

    /**
     * @param config - The adapter configuration.
     * @param verifier - Discovery and ID-token verification.
     */
    constructor(config: OIDCAdapterConfig, verifier: OIDCVerifier) {
        this.#config = config;
        this.#verifier = verifier;
        this.#pending = config.pendingStore ?? new InMemoryPendingAuthorizationStore();
        this.#refresh = config.refreshStore ?? new InMemoryRefreshTokenStore();
    }

    /**
     * Creates an authorization request: generates `state`, PKCE S256
     * parameters, and `nonce`, stores the pending request, and returns the
     * authorization-endpoint URL.
     *
     * @returns The authorization URL and the generated state/nonce/PKCE values.
     */
    async createAuthorizationRequest(): Promise<AuthorizationRequest> {
        const doc = this.#config.discovery ? await this.#verifier.ensureDiscovery() : null;
        const authorizationEndpoint = doc
            ? doc.authorizationEndpoint
            : `${this.#config.issuer.replace(/\/$/, '')}/authorize`;

        const state = randomToken(32);
        const nonce = randomToken(32);
        const codeVerifier = randomToken(CODE_VERIFIER_BYTES);
        const expiresAt = Date.now() + (this.#config.authorizationTtlMs ?? DEFAULT_AUTHORIZATION_TTL_MS);

        await this.#pending.set(state, { state, nonce, codeVerifier, expiresAt });

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.#config.clientId,
            redirect_uri: this.#config.redirectUri,
            scope: (this.#config.scopes ?? ['openid', 'profile', 'email']).join(' '),
            state,
            nonce,
        });
        params.set('code_challenge', await pkceCodeChallenge(codeVerifier));
        params.set('code_challenge_method', 'S256');
        if (this.#config.prompt) {
            params.set('prompt', this.#config.prompt);
        }

        return { url: `${authorizationEndpoint}?${params.toString()}`, state, nonce, codeVerifier, expiresAt };
    }

    /**
     * Consumes the pending request matching `state` and exchanges the
     * authorization code for tokens.
     *
     * @param code - The authorization code returned by the provider.
     * @param state - The state parameter returned alongside the code.
     * @returns The verified principal, tokens, and expiry.
     * @throws When the state is unknown/expired or token verification fails.
     */
    async exchangeCodeForTokens(code: string, state: string): Promise<OIDCResult> {
        const pending = await this.#pending.get(state);
        if (!pending || pending.expiresAt < Date.now()) {
            await this.#pending.delete(state);
            throw new OIDCError('invalid_state', 'Unknown, expired, or already-used state parameter');
        }
        await this.#pending.delete(state);

        const doc = this.#config.discovery ? await this.#verifier.ensureDiscovery() : null;
        const tokenEndpoint = doc ? doc.tokenEndpoint : `${this.#config.issuer.replace(/\/$/, '')}/token`;

        let rawResponse: unknown;
        try {
            rawResponse = await fetchOidcJson(this.#config, new URL(tokenEndpoint), 'token exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.#config.redirectUri,
                    client_id: this.#config.clientId,
                    ...(this.#config.clientSecret ? { client_secret: this.#config.clientSecret } : {}),
                    code_verifier: pending.codeVerifier,
                }),
            });
        } catch (error) {
            if (error instanceof OIDCError) throw error;
            throw new OIDCError('network', 'Token exchange request failed', { cause: error });
        }

        const tokens = this.#assertTokenResponse(rawResponse);
        const payload = await this.#verifier.verifyIdToken(tokens.idToken, pending.nonce);
        const principal = principalFromPayload(payload);

        // Bind the refresh token to the verified subject: refresh() redeems
        // only tokens this adapter captured, and only for that principal.
        if (tokens.refreshToken !== null) {
            await this.#refresh.set(hashRefreshToken(tokens.refreshToken), { subject: principal.id });
        }

        return {
            principal,
            token: tokens.accessToken ?? tokens.idToken,
            expiresAt: tokens.expiresIn !== null ? Date.now() + tokens.expiresIn * 1000 : null,
            refreshToken: tokens.refreshToken,
        };
    }

    /**
     * Exchanges a captured refresh token for a new token set
     * (`grant_type=refresh_token`), deduplicating concurrent refreshes for
     * the same token.
     *
     * @param token - The refresh token captured from the exchange.
     * @returns The refreshed principal, tokens, and expiry.
     */
    async refresh(token: string): Promise<OIDCResult> {
        const key = hashRefreshToken(token);
        const existing = this.#refreshInFlight.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const promise = this.#doRefresh(token).finally(() => {
            this.#refreshInFlight.delete(key);
        });
        this.#refreshInFlight.set(key, promise);
        return promise;
    }

    async #doRefresh(token: string): Promise<OIDCResult> {
        const binding = await this.#refresh.get(hashRefreshToken(token));
        if (binding === null) {
            throw new OIDCError('invalid_token', 'Unknown or already-consumed refresh token');
        }

        const doc = this.#config.discovery ? await this.#verifier.ensureDiscovery() : null;
        const tokenEndpoint = doc ? doc.tokenEndpoint : `${this.#config.issuer.replace(/\/$/, '')}/token`;

        let rawResponse: unknown;
        try {
            rawResponse = await fetchOidcJson(this.#config, new URL(tokenEndpoint), 'token refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: token,
                    client_id: this.#config.clientId,
                    ...(this.#config.clientSecret ? { client_secret: this.#config.clientSecret } : {}),
                }),
            });
        } catch (error) {
            if (
                error instanceof OIDCError &&
                error.code === 'network' &&
                (error.httpStatus === 400 || error.httpStatus === 401)
            ) {
                if (error.oauthError !== undefined && error.oauthError !== 'invalid_grant') {
                    throw new OIDCError(
                        'configuration',
                        `The identity provider rejected the refresh: ${error.oauthError}`,
                        {
                            cause: error,
                            httpStatus: error.httpStatus,
                            oauthError: error.oauthError,
                        }
                    );
                }
                throw new OIDCError(
                    'invalid_token',
                    'The identity provider rejected the refresh token (invalid_grant)',
                    {
                        cause: error,
                        httpStatus: error.httpStatus,
                        oauthError: 'invalid_grant',
                    }
                );
            }
            if (error instanceof OIDCError) throw error;
            throw new OIDCError('network', 'Token refresh request failed', { cause: error });
        }

        const tokens = this.#assertTokenResponse(rawResponse);
        const payload = await this.#verifier.verifyIdToken(tokens.idToken, null);
        const principal = principalFromPayload(payload);
        if (principal.id !== binding.subject) {
            throw new OIDCError('invalid_token', 'ID token subject does not match the refresh-token binding');
        }

        // Rotation consumes the presented token; without rotation it stays
        // current (the provider still accepts it).
        if (tokens.refreshToken !== null) {
            await this.#refresh.delete(hashRefreshToken(token));
            await this.#refresh.set(hashRefreshToken(tokens.refreshToken), { subject: binding.subject });
        }

        return {
            principal,
            token: tokens.accessToken ?? tokens.idToken,
            expiresAt: tokens.expiresIn !== null ? Date.now() + tokens.expiresIn * 1000 : null,
            refreshToken: tokens.refreshToken,
        };
    }

    /** Validates the token-endpoint response shape before any claim work. */
    #assertTokenResponse(raw: unknown): TokenResponse {
        if (typeof raw !== 'object' || raw === null) {
            throw new OIDCError('malformed_response', 'Token response is not a JSON object');
        }
        const response = raw as Record<string, unknown>;
        if (typeof response.id_token !== 'string' || response.id_token.length === 0) {
            throw new OIDCError('malformed_response', 'Token response is missing id_token');
        }
        if (
            response.access_token !== undefined &&
            response.access_token !== null &&
            typeof response.access_token !== 'string'
        ) {
            throw new OIDCError('malformed_response', 'Token response access_token is not a string');
        }
        if (
            response.expires_in !== undefined &&
            response.expires_in !== null &&
            (typeof response.expires_in !== 'number' || !Number.isFinite(response.expires_in))
        ) {
            throw new OIDCError('malformed_response', 'Token response expires_in is not a number');
        }
        if (
            response.refresh_token !== undefined &&
            response.refresh_token !== null &&
            typeof response.refresh_token !== 'string'
        ) {
            throw new OIDCError('malformed_response', 'Token response refresh_token is not a string');
        }
        return {
            idToken: response.id_token,
            accessToken: typeof response.access_token === 'string' ? response.access_token : null,
            expiresIn: typeof response.expires_in === 'number' ? response.expires_in : null,
            refreshToken:
                typeof response.refresh_token === 'string' && response.refresh_token.length > 0
                    ? response.refresh_token
                    : null,
        };
    }
}
