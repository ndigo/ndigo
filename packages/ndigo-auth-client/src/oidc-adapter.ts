/**
 */
import { base64url, createRemoteJWKSet, decodeJwt, jwtVerify, type JWTPayload } from 'jose';
import { createHash } from 'node:crypto';
import { randomToken } from '@ndigo/util';
import { HTTPHeaders } from '@ndigo/http';
import { type AuthAdapter } from '@ndigo/auth-core';
import { type Principal } from '@ndigo/auth-core';
import { type AuthResult } from '@ndigo/auth-core';

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
export class OIDCError extends Error {
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
 * JWS algorithms allowed for ID-token verification. `none` and shared-secret
 * algorithms are rejected by default; override only with an asymmetric list.
 */
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

/** Upper bound on concurrently pending authorization requests (the default in-memory store's cap). */
const MAX_PENDING_AUTHORIZATIONS = 20;

/** Upper bound on tracked refresh-token bindings (the default in-memory store's cap). */
const MAX_REFRESH_BINDINGS = 100;

/** PKCE code-verifier length in bytes (RFC 7636 recommends 32 octets of entropy). */
const CODE_VERIFIER_BYTES = 32;

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
     * another server — fails with `invalid_token` unless a store over
     * shared storage is supplied.
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
interface DiscoveryDocument {
    issuer: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    jwksUri: string | null;
    endSessionEndpoint: string | null;
}

/** Validated token-endpoint response. */
interface TokenResponse {
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
    /** Returns the pending request for `state`, or `null` when unknown. */
    get(state: string): Promise<PendingAuthorization | null>;
    /** Stores `pending` under `state`, replacing any existing entry. */
    set(state: string, pending: PendingAuthorization): Promise<void>;
    /** Removes the entry for `state`; unknown keys are a no-op. */
    delete(state: string): Promise<void>;
}

/**
 * Default {@link PendingAuthorizationStore}: a bounded in-memory map scoped
 * to a single adapter instance.
 *
 * At the cap (20 entries) `set` evicts the oldest entry — the same memory
 * bound the adapter previously applied inline — so a creation flood cannot
 * grow the map without limit. Entries persist until redeemed or evicted.
 */
export class InMemoryPendingAuthorizationStore implements PendingAuthorizationStore {
    readonly kind = 'in-memory';

    readonly #entries = new Map<string, PendingAuthorization>();

    async get(state: string): Promise<PendingAuthorization | null> {
        return this.#entries.get(state) ?? null;
    }

    async set(state: string, pending: PendingAuthorization): Promise<void> {
        // Bound memory: evict the oldest pending request when full.
        while (this.#entries.size >= MAX_PENDING_AUTHORIZATIONS) {
            const oldestKey = this.#entries.keys().next().value;
            if (oldestKey === undefined) break;
            this.#entries.delete(oldestKey);
        }
        this.#entries.set(state, pending);
    }

    async delete(state: string): Promise<void> {
        this.#entries.delete(state);
    }
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
    /** Returns the binding for `token`, or `null` when unknown or consumed. */
    get(token: string): Promise<RefreshTokenBinding | null>;
    /** Stores the binding for `token`, replacing any existing entry. */
    set(token: string, binding: RefreshTokenBinding): Promise<void>;
    /** Removes the binding for `token` (rotation consumes the presented token). */
    delete(token: string): Promise<void>;
}

/**
 * Default {@link RefreshTokenStore}: a bounded in-memory map scoped to a
 * single adapter instance.
 *
 * At the cap (100 entries) `set` evicts the oldest binding, so a refresh
 * flood cannot grow the map without limit.
 */
export class InMemoryRefreshTokenStore implements RefreshTokenStore {
    readonly kind = 'in-memory';

    readonly #entries = new Map<string, RefreshTokenBinding>();

    async get(token: string): Promise<RefreshTokenBinding | null> {
        return this.#entries.get(token) ?? null;
    }

    async set(token: string, binding: RefreshTokenBinding): Promise<void> {
        // Bound memory: evict the oldest binding when full.
        while (this.#entries.size >= MAX_REFRESH_BINDINGS) {
            const oldestKey = this.#entries.keys().next().value;
            if (oldestKey === undefined) break;
            this.#entries.delete(oldestKey);
        }
        this.#entries.set(token, binding);
    }

    async delete(token: string): Promise<void> {
        this.#entries.delete(token);
    }
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

function isLoopbackHost(hostname: string): boolean {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return (
        host === 'localhost' ||
        host === '::1' ||
        host === '::ffff:127.0.0.1' ||
        (host.startsWith('127.') && host.split('.').length === 4) ||
        host.endsWith('.localhost')
    );
}

/**
 * Enforces HTTPS (loopback exempt) for every remote URL the adapter fetches
 * or redirects to.
 */
function assertTrustedUrl(url: URL, label: string): void {
    if (url.protocol !== 'https:' && !isLoopbackHost(url.hostname)) {
        throw new OIDCError(
            'configuration',
            `${label} must use HTTPS (loopback exempt): ${url.protocol} is not allowed`
        );
    }
}

async function pkceCodeChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64url.encode(new Uint8Array(digest));
}

function readRoles(payload: JWTPayload): string[] {
    const raw = payload.roles;
    if (!Array.isArray(raw)) return [];
    return raw.filter((role): role is string => typeof role === 'string');
}

function principalFromPayload(payload: JWTPayload): Principal {
    const sub = payload.sub;
    // #assertClaims rejects any token without a non-empty string `sub`; this guard
    // keeps that invariant explicit and fails closed if the helper is ever reached
    // from an unverified path.
    if (typeof sub !== 'string' || sub.length === 0) {
        throw new OIDCError('invalid_token', 'ID token is missing a non-empty subject (sub) claim');
    }
    const roles = readRoles(payload);
    return {
        id: sub,
        name:
            (typeof payload.name === 'string' && payload.name) ||
            (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
            'Unknown',
        roles,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...wanted: string[]) => wanted.some((role) => roles.includes(role)),
    };
}

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
/** Hashes a refresh token for use as a store key (never store the raw bearer). */
function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export class OIDCAdapter implements AuthAdapter {
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

    async authenticate(_credentials: unknown): Promise<AuthResult> {
        // OIDC uses the authorization code flow, not direct credential authentication.
        throw new Error(
            'OIDCAdapter does not support direct credential authentication — use createAuthorizationRequest() and exchangeCodeForTokens()'
        );
    }

    /**
     * Builds the provider's end-session URL from discovery metadata.
     * Returns `null` when discovery is disabled or no end-session endpoint
     * is advertised.
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

    async logout(_token: string): Promise<void> {
        // OIDC logout requires redirecting the user to the provider's
        // end_session_endpoint — see getEndSessionUrl().
    }
}
