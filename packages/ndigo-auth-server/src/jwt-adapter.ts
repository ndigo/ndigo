/**
 * JWT authentication adapter: issuance, validation, refresh, and revocation.
 */
import { jwtVerify, type JWTPayload } from 'jose';
import { DefaultPrincipal, type AuthAdapter, type AuthResult, type Principal, type UserStore } from '@ndigo/auth-core';
import { FrameworkError } from '@ndigo/core';
import { JWTKeyResolver } from './_jwt-keys.js';
import { JWTRevocationTracker } from './_jwt-revocation.js';
import { principalFromPayload, storeIdentity } from './_jwt-identity.js';
import { JWTTokenError } from './jwt-adapter-types.js';
import type { JWTAdapterConfig, JWTRefreshResult, TokenSubject } from './jwt-adapter-types.js';

const DEFAULT_ACCESS_TTL_MS = 15 * 60 * 1000;
const DEFAULT_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A reference implementation of {@link AuthAdapter} for JWT-based authentication.
 *
 * Uses `jose` for cryptographic signature verification:
 * - HMAC algorithms (HS256/HS384/HS512) via the shared `secret`
 * - Asymmetric algorithms (RS256/ES256/…) via a PEM `publicKey` or a JWKS
 *   endpoint (`jwksUrl`, auto-rotating + cached)
 *
 * Issuer, audience, `exp`, and `sub` are required and validated on every token.
 *
 * With a `userStore` wired, the adapter also owns issuance and
 * revocation: `issueTokens` mints access + refresh JWTs snapshotting the
 * account's `tokenVersion` (`ver` claim); `refresh` advances the version —
 * every older access AND refresh token dies, so reuse of a rotated-out
 * refresh is rejected by construction (no ledger needed — the family
 * moves forward); `logout` advances the version outright.
 *
 * @example
 * ```ts
 * const instance = new JWTAdapter();
 * ```
 */
export class JWTAdapter implements AuthAdapter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "JWTAdapter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object JWTAdapter]"
     */
    get [Symbol.toStringTag](): string {
        return 'JWTAdapter';
    }

    /** Adapter identifier (`'jwt'`). */
    readonly id = 'jwt';
    readonly #config: JWTAdapterConfig;
    readonly #keys: JWTKeyResolver;
    readonly #revocation: JWTRevocationTracker;
    readonly #userStore: UserStore | undefined;
    readonly #accessTtlMs: number;
    readonly #refreshTtlMs: number;

    constructor(config: JWTAdapterConfig) {
        this.#config = config;
        this.#keys = new JWTKeyResolver(config);
        this.#revocation = new JWTRevocationTracker(config.userStore, config.revocationCacheTtlMs ?? 0);
        this.#userStore = config.userStore;
        this.#accessTtlMs = config.accessTokenTtlMs ?? DEFAULT_ACCESS_TTL_MS;
        this.#refreshTtlMs = config.refreshTokenTtlMs ?? DEFAULT_REFRESH_TTL_MS;
    }

    /**
     * Validates a JWT token and returns the associated principal.
     *
     * @remarks Verifies the signature cryptographically via `jose` for both
     * HMAC and asymmetric algorithms (RS256/ES256…), and requires the
     * issuer, audience, `exp`, and `sub` claims. Trailing whitespace and
     * other spec allowances are handled by `jose`.
     *
     * @param token - The JWT to validate.
     * @returns The authenticated {@link Principal}, or `null` if validation fails.
     */
    async validate(token: string): Promise<Principal | null> {
        try {
            const key = await this.#keys.resolve();
            // jose's jwtVerify overloads (a concrete key vs a JWKS getKey
            // function) resolve statically on the `Uint8Array | JWTVerifyGetKey`
            // union — a single call picks the union-aware overload.
            const { payload } = await jwtVerify(token, key, this.#keys.verifyOptions());

            // Only access tokens are credentials. Framework refresh tokens
            // carry `token_use: 'refresh'` (7-day TTL) and must never
            // authenticate an API request; a present claim that is anything
            // but 'access' fails closed. External IdP tokens without the
            // claim are unaffected.
            if (payload.token_use !== undefined && payload.token_use !== 'access') {
                return null;
            }

            // Framework-issued tokens carry `ver`; when a store is
            // wired, the claim must equal the account's current version.
            // An HS* adapter issues its own tokens, so a missing `ver` is a
            // malformed token and fails closed; external IdP tokens
            // (asymmetric validation) legitimately carry no `ver` and skip
            // the check. `currentVersion` returns null for disabled/deleted
            // accounts too, so the same gate revokes their live tokens.
            if (this.#userStore && typeof payload.sub === 'string') {
                if (typeof payload.ver === 'number') {
                    const current = await this.#revocation.currentVersion(payload.sub);
                    if (current === null || current !== payload.ver) return null;
                } else if (this.#config.algorithm.startsWith('HS')) {
                    return null;
                }
            }

            return principalFromPayload(payload);
        } catch {
            return null;
        }
    }

    /**
     * Rejects direct credential authentication; JWT issuance is separate.
     *
     * @param _credentials - Ignored; direct credentials are unsupported.
     * @returns Never — this method always throws.
     * @throws Always, directing callers to an identity provider or auth flow.
     */
    async authenticate(_credentials: unknown): Promise<AuthResult> {
        // Credential validation is outside the scope of a JWT adapter.
        // Use an identity provider or database-backed auth flow.
        throw new FrameworkError('JWTAdapter.authenticate() not implemented - use a proper auth flow');
    }

    /**
     * Mints an access + refresh token pair.
     *
     * HMAC (HS*) configurations only: asymmetric configs hold a public
     * key for validation, not a signing key — external IdPs own issuance
     * there. With a user store wired, the account must exist, be enabled,
     * and the `ver` claim snapshots the store's CURRENT `tokenVersion`
     * (never a caller-supplied value).
     *
     * @param subject - The account to issue tokens for.
     * @returns The access and refresh tokens with the access expiry.
     */
    async issueTokens(
        subject: TokenSubject
    ): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
        const identity = this.#userStore
            ? await storeIdentity(this.#userStore, subject.id, subject.scopes)
            : {
                  id: subject.id,
                  name: subject.name ?? subject.id,
                  roles: subject.roles ?? [],
                  scopes: subject.scopes ?? [],
                  tokenVersion: subject.tokenVersion ?? 0,
              };
        const now = Date.now();
        const accessToken = await this.#keys.sign(
            {
                sub: identity.id,
                name: identity.name,
                roles: [...identity.roles],
                ...(identity.scopes.length === 0 ? {} : { scope: identity.scopes.join(' ') }),
                ver: identity.tokenVersion,
                token_use: 'access',
            },
            now + this.#accessTtlMs
        );
        const refreshToken = await this.#keys.sign(
            { sub: identity.id, ver: identity.tokenVersion, token_use: 'refresh' },
            now + this.#refreshTtlMs
        );
        return { accessToken, refreshToken, expiresAt: now + this.#accessTtlMs };
    }

    /**
     * Rotates a refresh token: issues a new access + refresh
     * pair AFTER advancing the account's `tokenVersion` — every older
     * token (access and refresh alike) is dead the moment a refresh lands,
     * so replaying a rotated-out refresh token is rejected by the version
     * comparison. No rotation ledger needed: the family moves forward.
     *
     * @param token - The refresh token to rotate.
     * @returns The principal and the new access/refresh pair.
     * @throws `JWTTokenError` when the token is invalid or superseded.
     */
    async refresh(token: string): Promise<JWTRefreshResult> {
        const store = this.#revocation.requireStore('refresh');
        let payload: JWTPayload;
        try {
            ({ payload } = await jwtVerify(token, await this.#keys.resolve(), this.#keys.verifyOptions()));
        } catch {
            throw new JWTTokenError('Invalid refresh token');
        }
        if (payload.token_use !== 'refresh') {
            throw new JWTTokenError('Token is not a refresh token');
        }
        if (typeof payload.sub !== 'string' || typeof payload.ver !== 'number') {
            throw new JWTTokenError('Malformed refresh token');
        }
        const user = await store.findById(payload.sub);
        if (!user || user.disabled === true) {
            throw new JWTTokenError('Account unknown or disabled');
        }
        // A compare-and-swap closes the check-then-bump TOCTOU. The
        // version advances only if it is still `payload.ver`; a concurrent
        // rotation that bumps it in between makes this refresh lose the race
        // (CAS returns null) instead of both refreshes succeeding.
        const nextVer = await store.incrementTokenVersionIfCurrent(user.id, payload.ver);
        if (nextVer === null) {
            throw new JWTTokenError('Refresh token superseded or revoked');
        }
        this.#revocation.cacheVersion(user.id, nextVer);
        const issued = await this.issueTokens({ id: user.id });
        return {
            principal: new DefaultPrincipal(user.id, user.username, user.roles ?? []),
            token: issued.accessToken,
            refreshToken: issued.refreshToken,
            expiresAt: issued.expiresAt,
        };
    }

    /**
     * Revokes every outstanding token for the token's account by
     * advancing `tokenVersion`. The presented token (access
     * or refresh) must verify — an unverifiable token revokes nothing and
     * throws (fail closed).
     *
     * @param token - The access or refresh token to revoke.
     * @returns A promise that resolves once the account version advances.
     */
    async logout(token: string): Promise<void> {
        const store = this.#revocation.requireStore('logout');
        let payload: JWTPayload;
        try {
            ({ payload } = await jwtVerify(token, await this.#keys.resolve(), this.#keys.verifyOptions()));
        } catch {
            throw new JWTTokenError('Invalid token');
        }
        if (typeof payload.sub !== 'string' || typeof payload.ver !== 'number') {
            throw new JWTTokenError('Malformed token');
        }
        // Compare-and-swap, not an unconditional bump: replaying a token that
        // was already rotated out must not advance the version again, or an
        // attacker holding an old token could revoke the live session.
        const nextVer = await store.incrementTokenVersionIfCurrent(payload.sub, payload.ver);
        if (nextVer === null) {
            throw new JWTTokenError('Token superseded or revoked');
        }
        this.#revocation.cacheVersion(payload.sub, nextVer);
    }
}

export * from './jwt-adapter-types.js';
