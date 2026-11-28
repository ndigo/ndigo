/**
 * JWT adapter configuration, results, and errors.
 */
import type { AuthResult, UserStore } from '@ndigo/auth-core';
import { FrameworkError } from '@ndigo/core';

export interface JWTAdapterConfig {
    /** The issuer (iss) claim to validate. */
    issuer: string;
    /** The audience (aud) claim to validate. */
    audience: string;
    /**
     * HMAC shared secret (HS256/HS384/HS512). Required when `algorithm` is
     * an HS* alg, and must be at least 32 bytes (256 bits) of UTF-8.
     */
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
    /**
     * User store backing `ver`-claim revocation. When present:
     * `validate` checks the `ver` claim of framework-issued tokens against
     * the account's `tokenVersion`, `issueTokens` snapshots the current
     * version, and `refresh`/`logout` advance it (rotating the family and
     * invalidating every older token). When the adapter validates its own
     * HMAC issuance, a token without `ver` fails closed. Asymmetric
     * configurations validate external IdP tokens, which carry no `ver` and
     * therefore skip the version check — revocation never rejects tokens
     * this adapter did not version.
     */
    userStore?: UserStore;
    /**
     * Short-TTL cache for `tokenVersion` reads during validation (ms).
     * `0` (default) reads the store on every validation — revocation is
     * visible immediately at the cost of one user-record read per request;
     * a positive value trades revocation latency for throughput.
     */
    revocationCacheTtlMs?: number;
    /** Lifetime of issued access tokens (default 15 minutes). */
    accessTokenTtlMs?: number;
    /** Lifetime of issued refresh tokens (default 7 days). */
    refreshTokenTtlMs?: number;
    /**
     * Clock skew tolerance (seconds) applied to the `exp`/`nbf` claim checks
     * (default 0). Raise it when token issuers and this verifier disagree on
     * the current time.
     */
    clockToleranceSeconds?: number;
}

/**
 * Error for refresh/issue/revocation failures: invalid, superseded or
 * revoked tokens, unknown/disabled accounts, and configuration that
 * cannot issue tokens. Always a `401`-class outcome at the flow level.
 *
 * @example
 * ```ts
 * const instance = new JWTTokenError();
 * ```
 */
export class JWTTokenError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "JWTTokenError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object JWTTokenError]"
     */
    get [Symbol.toStringTag](): string {
        return 'JWTTokenError';
    }

    constructor(message: string) {
        super(message);
        this.name = 'JWTTokenError';
    }
}

/**
 * The result of `JWTAdapter.refresh`: the `AuthResult` contract
 * (`token` = the new access token) plus the rotated refresh token.
 *
 * @example
 * ```ts
 * const value = {} as JWTRefreshResult;
 * ```
 */
export interface JWTRefreshResult extends AuthResult {
    /** New access token. */
    token: string;
    /** New (rotated) refresh token — the old one is dead. */
    refreshToken: string;
}

/**
 * The identity to issue tokens for (`JWTAdapter.issueTokens`). When a
 * user store is wired, the store's record wins (roles + current
 * `tokenVersion`); the subject fields are the store-less fallback.
 *
 * @example
 * ```ts
 * const value = {} as TokenSubject;
 * ```
 */
export interface TokenSubject {
    /** Account id (the `sub` claim). */
    id: string;
    /** Display name (store-less mode). */
    name?: string;
    /** Roles (store-less mode). */
    roles?: readonly string[];
    /** OAuth scopes (store-less mode; emitted as the `scope` claim). */
    scopes?: readonly string[];
    /** Token version (store-less mode; store mode reads the live value). */
    tokenVersion?: number;
}
