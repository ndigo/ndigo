/**
 * OIDC authorization-code adapter with PKCE, refresh, and validation.
 */
import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from 'jose';
import { randomToken } from '@ndigo/util';
import { HTTPHeaders } from '@ndigo/http';
import { type AuthAdapter, type AuthResult, type Principal } from '@ndigo/auth-core';
import { FrameworkError } from '@ndigo/core';
import {
    OIDCError,
    type OIDCAdapterConfig,
    type AuthorizationRequest,
    type DiscoveryDocument,
    type TokenResponse,
    type PendingAuthorizationStore,
    type RefreshTokenStore,
    type OIDCResult,
} from './oidc-types';
import { InMemoryPendingAuthorizationStore, InMemoryRefreshTokenStore } from './oidc-stores';
import { assertTrustedUrl, pkceCodeChallenge, principalFromPayload, hashRefreshToken } from './_oidc-helpers';

// Re-export moved contracts/stores so existing imports (`from '../src/oidc-adapter'`)
// and the package barrel keep resolving.
export * from './oidc-types';
export * from './oidc-stores';

const DEFAULT_ALLOWED_ALGORITHMS = [
    'RS256',
    'RS384',
    'RS512',
    'ES256',
    'ES384',
    'ES512',
    'PS256',
    'PS384',
    'PS512',
    'EdDSA',
] as const;

/** Pending authorization requests live at most this long (default 10 minutes). */
const DEFAULT_AUTHORIZATION_TTL_MS = 600_000;

/** Default cap for discovery/JWKS response bodies. */
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;

/** Default remote fetch timeout. */
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

/** PKCE code-verifier length in bytes (RFC 7636 recommends 32 octets of entropy). */
const CODE_VERIFIER_BYTES = 32;

/**
 * An {@link AuthAdapter} implementation for OpenID Connect (OIDC).
 *
 * This adapter implements the OIDC authorization code flow with PKCE,
 * plus the refresh-token grant:
 * - Resolving endpoints from validated discovery metadata (optional)
 * - Redirecting to the identity provider with `state`, PKCE, and `nonce`
 * - Exchanging the authorization code for tokens (capturing any
 *   `refresh_token` and binding it to the verified subject)
 * - Exchanging a captured refresh token for a new token set
 *   (`grant_type=refresh_token`) with the same verification discipline
 * - Verifying ID-token signature, issuer, audience, expiration, and nonce
 *   before constructing a principal
 *
 * @remarks Verification is mandatory: construct with `jwksUrl`, `discovery`,
 * or `tokenValidator`. There is no claim-only mode.
 *
 * Pending authorization requests live in a {@link PendingAuthorizationStore}
 * and refresh-token bindings in a {@link RefreshTokenStore}. The defaults
 * are in-memory and scoped to this adapter instance, so a flow that spans a
 * redirect or a refresh that arrives on another instance MUST reuse that
 * instance or inject a shared store — see
 * {@link OIDCAdapterConfig.pendingStore} and
 * {@link OIDCAdapterConfig.refreshStore}.
 */
export class OIDCAdapter implements AuthAdapter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "OIDCAdapter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object OIDCAdapter]"
     */
    get [Symbol.toStringTag](): string {
        return 'OIDCAdapter';
    }

    /** Adapter identifier (`'oidc'`). */
    readonly id = 'oidc';
    readonly #config: OIDCAdapterConfig;
    readonly #discoveryUrl: string;
    #discoveryPromise: Promise<DiscoveryDocument> | null = null;
    #jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
    readonly #pending: PendingAuthorizationStore;
    readonly #refresh: RefreshTokenStore;
    readonly #refreshInFlight = new Map<string, Promise<OIDCResult>>();

    constructor(config: OIDCAdapterConfig) {
        this.#config = config;
        if (!config.jwksUrl && !config.discovery && !config.tokenValidator) {
            throw new OIDCError(
                'configuration',
                'OIDCAdapter requires a trusted verification source: provide jwksUrl, discovery: true, or tokenValidator. ' +
                    'Accepting tokens without signature verification is not supported.'
            );
        }
        this.#pending = config.pendingStore ?? new InMemoryPendingAuthorizationStore();
        this.#refresh = config.refreshStore ?? new InMemoryRefreshTokenStore();
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
     */
    async #ensureDiscovery(): Promise<DiscoveryDocument> {
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

    async #fetchDiscovery(): Promise<DiscoveryDocument> {
        const raw = await this.#fetchJson(new URL(this.#discoveryUrl), 'discovery document');
        if (typeof raw !== 'object' || raw === null) {
            throw new OIDCError('discovery', 'Discovery document is not a JSON object');
        }
        const doc = raw as Record<string, unknown>;
        if (doc.issuer !== this.#config.issuer) {
            throw new OIDCError('discovery', 'Discovery document issuer does not match the configured issuer');
        }
        const endpoints = {
            issuer: this.#config.issuer,
            authorizationEndpoint: this.#assertTrustedEndpoint(doc.authorization_endpoint, 'authorization_endpoint'),
            tokenEndpoint: this.#assertTrustedEndpoint(doc.token_endpoint, 'token_endpoint'),
            jwksUri: doc.jwks_uri === undefined ? null : this.#assertTrustedEndpoint(doc.jwks_uri, 'jwks_uri'),
            endSessionEndpoint:
                doc.end_session_endpoint === undefined
                    ? null
                    : this.#assertTrustedEndpoint(doc.end_session_endpoint, 'end_session_endpoint'),
        };
        return endpoints;
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
            const doc = await this.#ensureDiscovery();
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

    /**
     * Fetches a JSON document with a timeout, HTTPS enforcement, a size cap,
     * and `redirect: 'error'` (a redirect must never carry a POST body such
     * as `client_secret` to an arbitrary URL). `init` adds method/body/
     * headers on top of those invariants.
     */
    async #fetchJson(
        url: URL,
        label: string,
        init: { method?: string; body?: BodyInit; headers?: Record<string, string> } = {}
    ): Promise<unknown> {
        assertTrustedUrl(url, label);
        const maxBytes = this.#config.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
        const timeoutMs = this.#config.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
        const controller = new AbortController();
        const timer = setTimeout(
            () => controller.abort(new OIDCError('network', `${label} fetch timed out`)),
            timeoutMs
        );
        try {
            const response = await fetch(url, { ...init, signal: controller.signal, redirect: 'error' });
            if (!response.ok) {
                let oauthError: string | undefined;
                try {
                    const text = await response.text();
                    const parsed = JSON.parse(text) as { error?: unknown };
                    if (typeof parsed?.error === 'string') oauthError = parsed.error;
                } catch {
                    // Body is not JSON (or empty); keep httpStatus only.
                }
                throw new OIDCError('network', `${label} fetch failed with status ${response.status}`, {
                    httpStatus: response.status,
                    oauthError,
                });
            }
            const contentLength = Number(HTTPHeaders.CONTENT_LENGTH.get(response.headers));
            if (Number.isFinite(contentLength) && contentLength > maxBytes) {
                throw new OIDCError('network', `${label} exceeds the ${maxBytes}-byte limit`);
            }
            if (!response.body) {
                try {
                    return JSON.parse(await response.text());
                } catch (error) {
                    throw new OIDCError('malformed_response', `${label} is not valid JSON`, { cause: error });
                }
            }
            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let received = 0;
            for (;;) {
                // oxlint-disable-next-line no-await-in-loop -- a ReadableStream must be consumed sequentially; chunks are validated and accumulated in order.
                const { done, value } = await reader.read();
                if (done) break;
                received += value.byteLength;
                if (received > maxBytes) {
                    void reader.cancel();
                    throw new OIDCError('network', `${label} exceeds the ${maxBytes}-byte limit`);
                }
                chunks.push(value);
            }
            const body = new Uint8Array(received);
            let offset = 0;
            for (const chunk of chunks) {
                body.set(chunk, offset);
                offset += chunk.byteLength;
            }
            try {
                return JSON.parse(new TextDecoder().decode(body));
            } catch (error) {
                throw new OIDCError('malformed_response', `${label} is not valid JSON`, { cause: error });
            }
        } catch (error) {
            if (error instanceof OIDCError) throw error;
            throw new OIDCError('network', `${label} fetch failed`, { cause: error });
        } finally {
            clearTimeout(timer);
        }
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

    /**
     * Full ID-token verification: structural decode, claim checks, then
     * signature verification via JWKS or the configured validator.
     */
    async #verifyIdToken(token: string, expectedNonce: string | null): Promise<JWTPayload> {
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

    /**
     * Creates an authorization request: generates `state`, PKCE S256
     * parameters, and `nonce`, stores the pending request in the configured
     * {@link PendingAuthorizationStore}, and returns the
     * authorization-endpoint URL to redirect the user to.
     *
     * @returns The authorization URL and the generated state/nonce/PKCE values.
     */
    async createAuthorizationRequest(): Promise<AuthorizationRequest> {
        const doc = this.#config.discovery ? await this.#ensureDiscovery() : null;
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
     * Consumes the pending authorization request matching `state` from the
     * configured {@link PendingAuthorizationStore} and exchanges the
     * authorization code for tokens at the token endpoint.
     *
     * Fails closed: unknown/expired `state`, malformed responses, and any
     * ID-token verification failure throw without mutating auth state. A
     * `refresh_token` in the response is captured and bound to the verified
     * subject for later {@link refresh} calls. With
     * the default in-memory store the callback must be handled by the same
     * adapter instance that created the request; inject a shared store to
     * survive redirects, restarts, or multiple instances.
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

        const doc = this.#config.discovery ? await this.#ensureDiscovery() : null;
        const tokenEndpoint = doc ? doc.tokenEndpoint : `${this.#config.issuer.replace(/\/$/, '')}/token`;

        let rawResponse: unknown;
        try {
            rawResponse = await this.#fetchJson(new URL(tokenEndpoint), 'token exchange', {
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
        const payload = await this.#verifyIdToken(tokens.idToken, pending.nonce);
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

    /**
     * Validates an OIDC ID token and extracts the principal.
     *
     * Verification is mandatory: signature (JWKS or configured validator),
     * issuer, audience, and expiration must all pass. Returns `null` on any
     * failure.
     *
     * @param token - The ID token to validate.
     * @returns The verified principal, or `null` on validation failure.
     */
    async validate(token: string): Promise<Principal | null> {
        try {
            const payload = await this.#verifyIdToken(token, null);
            return principalFromPayload(payload);
        } catch (error) {
            if (!(error instanceof OIDCError)) {
                throw new OIDCError('invalid_token', 'ID token validation failed unexpectedly', { cause: error });
            }
            if (error.code === 'configuration') throw error;
            return null;
        }
    }

    /**
     * Rejects direct credential authentication; OIDC uses the authorization
     * code flow instead.
     *
     * @param _credentials - Ignored; direct credentials are unsupported.
     * @returns Never — this method always throws.
     * @throws Always, directing callers to the authorization-code flow.
     */
    async authenticate(_credentials: unknown): Promise<AuthResult> {
        // OIDC uses the authorization code flow, not direct credential authentication.
        throw new FrameworkError(
            'OIDCAdapter does not support direct credential authentication — use createAuthorizationRequest() and exchangeCodeForTokens()'
        );
    }

    /**
     * Builds the provider's end-session URL from discovery metadata.
     * Returns `null` when discovery is disabled or no end-session endpoint
     * is advertised.
     *
     * @param idTokenHint - Optional ID token hint for the provider.
     * @param postLogoutRedirectUri - Optional URL to return to after logout.
     * @returns The end-session URL, or `null` when unavailable.
     */
    async getEndSessionUrl(idTokenHint?: string, postLogoutRedirectUri?: string): Promise<string | null> {
        if (!this.#config.discovery) return null;
        const doc = await this.#ensureDiscovery();
        if (!doc.endSessionEndpoint) return null;
        const url = new URL(doc.endSessionEndpoint);
        if (idTokenHint !== undefined) url.searchParams.set('id_token_hint', idTokenHint);
        if (postLogoutRedirectUri !== undefined)
            url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
        return url.toString();
    }

    /**
     * Exchanges a refresh token for a new token set (`grant_type=refresh_token`)
     * at the token endpoint — discovery-resolved when enabled, with client-secret
     * authentication for confidential clients.
     *
     * Only refresh tokens this adapter **captured** from a code exchange (or a
     * previous rotation, per the configured {@link RefreshTokenStore}) are
     * accepted: presenting an access or ID token fails with `invalid_token`
     * before any network call (the SE-7 mirror — as refresh tokens never
     * authenticate, access tokens never refresh).
     *
     * The response's ID token passes the full verification path (signature,
     * issuer, audience, expiration) with **no nonce** — the nonce binds the
     * authorization flow only — and its subject must match the binding
     * recorded for the presented token.
     *
     * Rotation: when the provider returns a new refresh token the presented
     * one is consumed (single-use); when it does not, the presented token
     * remains redeemable. Provider rejections (`400 invalid_grant` — expired,
     * revoked, or already-rotated tokens) surface as `invalid_token`, not as
     * transport errors.
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

        const doc = this.#config.discovery ? await this.#ensureDiscovery() : null;
        const tokenEndpoint = doc ? doc.tokenEndpoint : `${this.#config.issuer.replace(/\/$/, '')}/token`;

        let rawResponse: unknown;
        try {
            rawResponse = await this.#fetchJson(new URL(tokenEndpoint), 'token refresh', {
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
        const payload = await this.#verifyIdToken(tokens.idToken, null);
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

    /**
     * No-op logout: OIDC logout requires a redirect to the provider's
     * end-session endpoint (see {@link OIDCAdapter.getEndSessionUrl}).
     *
     * @param _token - Ignored; the provider owns the browser session.
     * @returns A promise that resolves immediately.
     */
    async logout(_token: string): Promise<void> {
        // OIDC logout requires redirecting the user to the provider's
        // end_session_endpoint — see getEndSessionUrl().
    }
}
