/**
 * OIDC authorization-code adapter with PKCE, refresh, and validation.
 */
import { type AuthAdapter, type AuthResult, type Principal } from '@ndigo/auth-core';
import { FrameworkError } from '@ndigo/core';
import { OIDCError, type AuthorizationRequest, type OIDCAdapterConfig, type OIDCResult } from './oidc-types.js';
import { principalFromPayload } from './_oidc-helpers.js';
import { OIDCVerifier } from './_oidc-verifier.js';
import { OIDCTokenFlow } from './_oidc-token-flow.js';

// Re-export moved contracts/stores so existing imports (`from '../src/oidc-adapter'`)
// and the package barrel keep resolving.
export * from './oidc-types.js';
export * from './oidc-stores.js';

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
 *
 * @example
 * ```ts
 * const instance = new OIDCAdapter();
 * ```
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
    readonly #verifier: OIDCVerifier;
    readonly #tokens: OIDCTokenFlow;

    /**
     * Creates an OIDC adapter.
     *
     * @param config - Issuer, client, redirect, verification source, and
     *   store seams.
     * @throws When no signature-verification source is configured.
     */
    constructor(config: OIDCAdapterConfig) {
        if (!config.jwksUrl && !config.discovery && !config.tokenValidator) {
            throw new OIDCError(
                'configuration',
                'OIDCAdapter requires a trusted verification source: provide jwksUrl, discovery: true, or tokenValidator. ' +
                    'Accepting tokens without signature verification is not supported.'
            );
        }
        this.#verifier = new OIDCVerifier(config);
        this.#tokens = new OIDCTokenFlow(config, this.#verifier);
    }

    /**
     * Creates an authorization request URL with `state`, PKCE, and `nonce`.
     *
     * @returns The authorization URL and the generated values.
     */
    createAuthorizationRequest(): Promise<AuthorizationRequest> {
        return this.#tokens.createAuthorizationRequest();
    }

    /**
     * Exchanges an authorization code (matching a pending `state`) for
     * verified tokens.
     *
     * @param code - The authorization code.
     * @param state - The state returned alongside the code.
     * @returns The verified principal, tokens, and expiry.
     */
    exchangeCodeForTokens(code: string, state: string): Promise<OIDCResult> {
        return this.#tokens.exchangeCodeForTokens(code, state);
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
            const payload = await this.#verifier.verifyIdToken(token, null);
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
        let doc;
        try {
            doc = await this.#verifier.ensureDiscovery();
        } catch (error) {
            if (error instanceof OIDCError && error.code === 'configuration') {
                return null;
            }
            throw error;
        }
        if (!doc.endSessionEndpoint) return null;
        const url = new URL(doc.endSessionEndpoint);
        if (idTokenHint !== undefined) url.searchParams.set('id_token_hint', idTokenHint);
        if (postLogoutRedirectUri !== undefined)
            url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
        return url.toString();
    }

    /**
     * Exchanges a captured refresh token for a new token set.
     *
     * @param token - The refresh token captured from the exchange.
     * @returns The refreshed principal, tokens, and expiry.
     */
    refresh(token: string): Promise<OIDCResult> {
        return this.#tokens.refresh(token);
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
