/**
 * OIDC type contracts: error codes, configuration, request/response shapes,
 * and persistence seams. Split out of `oidc-adapter.ts` for single-responsibility.
 */
import { FrameworkError } from '@ndigo/core';
import type { AuthResult } from '@ndigo/auth-core';

/**
 * Error codes for OIDC failures. The message is safe to expose; the cause
 * (when attached) carries internal detail.
 */
export type OIDCErrorCode =
    | 'configuration'
    | 'discovery'
    | 'network'
    | 'malformed_response'
    | 'malformed_token'
    | 'invalid_token'
    | 'invalid_state'
    | 'invalid_nonce';

/**
 * An OIDC-specific failure. Every authorization/token failure mode throws
 * this so callers can distinguish provider errors from programming errors.
 */
export class OIDCError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "OIDCError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object OIDCError]"
     */
    get [Symbol.toStringTag](): string {
        return 'OIDCError';
    }

    /** The failure code. */
    readonly code: OIDCErrorCode;
    /**
     * The HTTP status behind a `network` failure, when one exists — lets
     * callers distinguish a provider rejection (e.g. a `400` on the refresh
     * grant) from a transport failure.
     */
    readonly httpStatus: number | undefined;
    /** The OAuth `error` code from a provider error response, when present. */
    readonly oauthError: string | undefined;

    constructor(
        code: OIDCErrorCode,
        message: string,
        options?: { cause?: unknown; httpStatus?: number; oauthError?: string }
    ) {
        super(message, options !== undefined ? { cause: options.cause } : undefined);
        this.name = 'OIDCError';
        this.code = code;
        this.httpStatus = options?.httpStatus;
        this.oauthError = options?.oauthError;
    }
}

/**
 * Configuration for the OIDC adapter.
 *
 * The adapter is **fail-closed**: at least one trusted token-verification
 * source is required at construction — `jwksUrl`, `discovery`, or an explicit
 * `tokenValidator`. Constructing without one throws.
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
    /**
     * Optional `prompt` value for the authorization request (e.g. `'consent'`,
     * `'login'`). Several providers require `prompt=consent` before they will
     * grant `offline_access` — and therefore issue refresh tokens.
     */
    prompt?: string;
    /** The audience claim to validate. Defaults to `clientId` when omitted. */
    audience?: string;
    /**
     * The provider's JWKS endpoint (`jwks_uri` from the OIDC discovery
     * document, or the provider's advertised JWKS URL). Tokens are verified
     * against these public keys. Required unless `discovery` or
     * `tokenValidator` is set.
     */
    jwksUrl?: string;
    /**
     * Resolve the authorization, token, JWKS, and end-session endpoints from
     * the provider's discovery document at `{issuer}/.well-known/openid-configuration`.
     * The document's `issuer` must equal the configured `issuer` exactly.
     */
    discovery?: boolean;
    /**
     * Explicit custom token validation callback. It is responsible for
     * signature verification; the adapter still enforces issuer, audience,
     * expiration, and (during the code flow) nonce independently.
     */
    tokenValidator?: (token: string, payload: Record<string, unknown>) => Promise<boolean>;
    /** Allowed JWS algorithms. Defaults to an asymmetric-only allowlist. */
    allowedAlgorithms?: string[];
    /** Timeout for discovery/JWKS/token-endpoint fetches (default 10s). */
    fetchTimeoutMs?: number;
    /** Maximum accepted size of discovery/JWKS responses (default 1 MiB). */
    maxResponseBytes?: number;
    /** Pending authorization-request lifetime in ms (default 10 minutes). */
    authorizationTtlMs?: number;
    /**
     * Persistence seam for pending authorization requests (`state`, `nonce`,
     * PKCE verifier) between the redirect and the callback. Defaults to an
     * in-memory store scoped to this adapter instance: a callback handled by
     * another instance — a fresh page load, a restart, or another server
     * instance — fails with `invalid_state` unless a store over shared
     * storage is supplied (for example `sessionStorage` in a browser or
     * Redis server-side).
     */
    pendingStore?: PendingAuthorizationStore;
    /**
     * Persistence seam for refresh-token bindings (which principal each
     * captured refresh token belongs to, single-use rotation included).
     * Defaults to an in-memory store scoped to this adapter instance: a
     * refresh arriving on another instance — a second tab, a restart, or
     * another server — fails with `invalid_token` unless a store over shared
     * storage is supplied.
     */
    refreshStore?: RefreshTokenStore;
}

/**
 * A pending authorization-code request created by {@link OIDCAdapter.createAuthorizationRequest}.
 *
 * `state` is the callback correlation value; re-read it from the
 * authorization response. The nonce and PKCE verifier live in the adapter's
 * configured {@link OIDCAdapterConfig.pendingStore} — see that option for
 * surviving the redirect across adapter instances.
 */
export interface AuthorizationRequest {
    /** The full authorization-endpoint URL to redirect the user to. */
    url: string;
    /** The CSRF `state` value carried through the provider round-trip. */
    state: string;
    /** The OIDC `nonce` bound into the resulting ID token. */
    nonce: string;
    /** The PKCE verifier; keep server-side or in session storage only. */
    codeVerifier: string;
    /** Epoch ms after which this request is no longer redeemable. */
    expiresAt: number;
}

/** Validated subset of an OIDC discovery document. */
export interface DiscoveryDocument {
    issuer: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    jwksUri: string | null;
    endSessionEndpoint: string | null;
}

/** Validated token-endpoint response. */
export interface TokenResponse {
    idToken: string;
    accessToken: string | null;
    expiresIn: number | null;
    refreshToken: string | null;
}

/**
 * One pending authorization-code request: the values
 * {@link OIDCAdapter.createAuthorizationRequest} generates and
 * {@link OIDCAdapter.exchangeCodeForTokens} needs to redeem the code.
 *
 * `nonce` and `codeVerifier` are secrets — treat them like credentials when
 * persisting; whoever holds them can bind a forged authorization response to
 * this request.
 */
export interface PendingAuthorization {
    /** The CSRF `state` value, used as the store key. */
    state: string;
    /** The OIDC `nonce` the resulting ID token must carry. */
    nonce: string;
    /** The PKCE S256 code verifier sent with the token exchange. */
    codeVerifier: string;
    /** Epoch ms after which the request is no longer redeemable. */
    expiresAt: number;
}

/**
 * Persistence seam for pending authorization requests.
 *
 * The adapter defaults to {@link InMemoryPendingAuthorizationStore}, an
 * in-memory map **scoped to one adapter instance**. That default cannot
 * survive the provider redirect when the callback is handled elsewhere — a
 * fresh page load, a process restart, or another server instance — so those
 * deployments MUST inject a store backed by shared storage (for example
 * `sessionStorage` in a browser or Redis server-side). With the default
 * store, only the instance that created the request can complete it.
 *
 * Redemption is single-use: the adapter deletes the entry after a successful
 * or expired lookup. Expiry is enforced by the adapter on every exchange;
 * implementations MAY additionally purge expired entries.
 */
export interface PendingAuthorizationStore {
    /**
     * Backend identifier for observability/diagnostics
     * (e.g. `'in-memory'`, `'session-storage'`, `'redis'`).
     */
    readonly kind: string;
    /**
     * Returns the pending request for `state`, or `null` when unknown.
     *
     * @param state - The authorization-state value.
     * @returns The pending authorization request, or `null`.
     */
    get(state: string): Promise<PendingAuthorization | null>;
    /**
     * Stores `pending` under `state`, replacing any existing entry.
     *
     * @param state - The authorization-state value.
     * @param pending - The pending request to store.
     * @returns A promise that resolves once stored.
     */
    set(state: string, pending: PendingAuthorization): Promise<void>;
    /**
     * Removes the entry for `state`; unknown keys are a no-op.
     *
     * @param state - The authorization-state value.
     * @returns A promise that resolves once removed.
     */
    delete(state: string): Promise<void>;
}

/**
 * The subject binding recorded for a refresh token: which principal the
 * token was issued for. Set when the code exchange (or a rotation) captures
 * the token; consulted on every refresh so the new ID token cannot switch
 * subjects mid-session.
 */
export interface RefreshTokenBinding {
    /** The verified `sub` of the ID token the refresh token was issued with. */
    subject: string;
}

/**
 * Persistence seam for refresh-token bindings.
 *
 * The adapter defaults to {@link InMemoryRefreshTokenStore}, an in-memory
 * map **scoped to one adapter instance** — both the binding and the
 * single-use rotation bookkeeping live there. Deployments where a refresh
 * may arrive on another instance (a second tab, a restart, or another
 * server) MUST inject a store backed by shared storage; with the default,
 * a refresh token captured elsewhere is rejected (`invalid_token`).
 *
 * Only tokens this adapter captured from its own exchanges (or rotations)
 * are redeemable — an access or ID token is never a refresh credential
 * (the SE-7 mirror: as refresh tokens never authenticate, access tokens
 * never refresh).
 */
export interface RefreshTokenStore {
    /**
     * Backend identifier for observability/diagnostics
     * (e.g. `'in-memory'`, `'redis'`).
     */
    readonly kind: string;
    /**
     * Returns the binding for `token`, or `null` when unknown or consumed.
     *
     * @param token - The refresh token.
     * @returns The recorded binding, or `null`.
     */
    get(token: string): Promise<RefreshTokenBinding | null>;
    /**
     * Stores the binding for `token`, replacing any existing entry.
     *
     * @param token - The refresh token.
     * @param binding - The subject binding to record.
     * @returns A promise that resolves once stored.
     */
    set(token: string, binding: RefreshTokenBinding): Promise<void>;
    /**
     * Removes the binding for `token` (rotation consumes the presented token).
     *
     * @param token - The refresh token.
     * @returns A promise that resolves once removed.
     */
    delete(token: string): Promise<void>;
}

/**
 * The result of a token-endpoint exchange: the `AuthResult` contract plus
 * the provider's refresh token. `refreshToken` is `null` when the provider
 * issued none for this result (a previously captured token then stays
 * current).
 */
export interface OIDCResult extends AuthResult {
    /** The provider's refresh token (`refresh_token`), or null when none was issued. */
    refreshToken: string | null;
}

// Re-export AuthAdapter/Principal/AuthResult types for convenience of consumers
// that import everything from this module's surface via the barrel.
export type { AuthAdapter } from '@ndigo/auth-core';
export type { Principal } from '@ndigo/auth-core';
export type { AuthResult } from '@ndigo/auth-core';
