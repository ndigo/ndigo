/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    jwtVerify,
    SignJWT,
    importSPKI,
    exportJWK,
    createLocalJWKSet,
    createRemoteJWKSet,
    type JWTPayload,
    type JWTVerifyGetKey,
    type JWTVerifyOptions,
} from 'jose';
import { type AuthAdapter, type AuthResult, type Principal, type UserStore, DefaultPrincipal } from '@ndigo/auth-core';

/**
 * Configuration for the JWT adapter.
 */
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
     * User store backing `ver`-claim revocation (AD-33 D-7). When present:
     * `validate` checks the `ver` claim of framework-issued tokens against
     * the account's `tokenVersion`, `issueTokens` snapshots the current
     * version, and `refresh`/`logout` advance it (rotating the family and
     * invalidating every older token). Tokens WITHOUT a `ver` claim (e.g.
     * external IdP tokens) skip the check — revocation never rejects
     * tokens this adapter did not version.
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
 */
export class JWTTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JWTTokenError';
    }
}

/**
 * The result of {@link JWTAdapter.refresh}: the `AuthResult` contract
 * (`token` = the new access token) plus the rotated refresh token.
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
 */
export interface TokenSubject {
    /** Account id (the `sub` claim). */
    id: string;
    /** Display name (store-less mode). */
    name?: string;
    /** Roles (store-less mode). */
    roles?: readonly string[];
    /** Token version (store-less mode; store mode reads the live value). */
    tokenVersion?: number;
}

const DEFAULT_ACCESS_TTL_MS = 15 * 60 * 1000;
const DEFAULT_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Minimum HMAC secret size in UTF-8 bytes (256 bits, matching SHA-256's block security). */
const MIN_HMAC_SECRET_BYTES = 32;

/**
 * Cap on the revocation `tokenVersion` cache (2026-11-02 review, L1). Entries
 * are keyed by account `sub` with a per-entry expiry that is only ever
 * overwritten on re-access — without a bound, a long-running server accrues
 * one stale entry per distinct account ever seen. Crossing the cap sweeps
 * expired entries first, then FIFO-evicts the oldest (Map iteration order is
 * insertion order), same discipline as `FixedWindowRateLimiter` (SEC-2). The
 * cache is a throughput optimization only: evicting a live entry costs one
 * `UserStore.findById`, never a wrong auth decision.
 */
const MAX_REVOCATION_CACHE_ENTRIES = 10_000;

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
 * With a `userStore` wired (AD-33 D-7), the adapter also owns issuance and
 * revocation: `issueTokens` mints access + refresh JWTs snapshotting the
 * account's `tokenVersion` (`ver` claim); `refresh` advances the version —
 * every older access AND refresh token dies, so reuse of a rotated-out
 * refresh is rejected by construction (no ledger needed — the family
 * moves forward); `logout` advances the version outright.
 */
export class JWTAdapter implements AuthAdapter {
    readonly id = 'jwt';
    #config: JWTAdapterConfig;
    #localJwks: JWTVerifyGetKey | null = null;
    #remoteJwks: JWTVerifyGetKey | null = null;
    readonly #userStore: UserStore | undefined;
    readonly #revocationCacheTtlMs: number;
    readonly #accessTtlMs: number;
    readonly #refreshTtlMs: number;
    readonly #versionCache = new Map<string, { version: number; expiresAt: number }>();

    constructor(config: JWTAdapterConfig) {
        if (config.algorithm.startsWith('HS')) {
            if (!config.secret) {
                throw new JWTTokenError(
                    `JWTAdapter: HMAC algorithm "${config.algorithm}" requires "secret" — validation and issuance fail without it`
                );
            }
            // SEC-2: HMAC security is bounded by the key's entropy; a short
            // secret is brute-forceable offline from a single signed token.
            const secretBytes = new TextEncoder().encode(config.secret).length;
            if (secretBytes < MIN_HMAC_SECRET_BYTES) {
                throw new JWTTokenError(
                    `JWTAdapter: HMAC algorithm "${config.algorithm}" requires a "secret" of at least ` +
                        `${MIN_HMAC_SECRET_BYTES} bytes (256 bits); got ${secretBytes} bytes`
                );
            }
        }
        this.#config = config;
        this.#userStore = config.userStore;
        this.#revocationCacheTtlMs = config.revocationCacheTtlMs ?? 0;
        this.#accessTtlMs = config.accessTokenTtlMs ?? DEFAULT_ACCESS_TTL_MS;
        this.#refreshTtlMs = config.refreshTokenTtlMs ?? DEFAULT_REFRESH_TTL_MS;
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
     * HMAC and asymmetric algorithms (RS256/ES256…), and requires the
     * issuer, audience, `exp`, and `sub` claims. Trailing whitespace and
     * other spec allowances are handled by `jose`.
     *
     * With a `userStore` wired, framework-issued tokens (`ver` claim) are
     * additionally checked against the live account: a bumped
     * `tokenVersion` or a disabled/deleted account rejects the token
     * (SE-7). External IdP tokens without `ver` skip the store check.
     *
     * Framework-issued **refresh** tokens (`token_use: 'refresh'`) are
     * never accepted here — only access tokens authenticate requests
     * (`token_use: 'access'`, or absent for external IdP tokens).
     *
     * @param token - The JWT to validate.
     * @returns The authenticated {@link Principal}, or `null` if validation fails.
     */
    async validate(token: string): Promise<Principal | null> {
        try {
            const key = await this.#resolveKey();
            // jose's jwtVerify overloads (a concrete key vs a JWKS getKey
            // function) resolve statically on the `Uint8Array | JWTVerifyGetKey`
            // union — a single call picks the union-aware overload.
            const { payload } = await jwtVerify(token, key, this.#verifyOptions());

            // Only access tokens are credentials. Framework refresh tokens
            // carry `token_use: 'refresh'` (7-day TTL) and must never
            // authenticate an API request; a present claim that is anything
            // but 'access' fails closed. External IdP tokens without the
            // claim are unaffected.
            if (payload.token_use !== undefined && payload.token_use !== 'access') {
                return null;
            }

            // AD-33 D-7: framework-issued tokens carry `ver`; when a store is
            // wired, the claim must equal the account's current version.
            // Tokens without `ver` (external IdP) skip the check entirely.
            // SE-7: `#currentVersion` returns null for disabled/deleted
            // accounts too, so the same gate revokes their live tokens.
            if (this.#userStore && typeof payload.ver === 'number' && typeof payload.sub === 'string') {
                const current = await this.#currentVersion(payload.sub);
                if (current === null || current !== payload.ver) return null;
            }

            return principalFromPayload(payload);
        } catch {
            return null;
        }
    }

    /**
     * The claims, issuer, audience, and algorithm options enforced on every
     * token. `requiredClaims` is what turns an absent `exp` (or `sub`) into
     * a verification failure instead of an unvalidated token.
     */
    #verifyOptions(): JWTVerifyOptions {
        return {
            issuer: this.#config.issuer,
            audience: this.#config.audience,
            algorithms: [this.#config.algorithm],
            requiredClaims: ['exp', 'sub'],
            clockTolerance: this.#config.clockToleranceSeconds ?? 0,
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

    /**
     * Mints an access + refresh token pair (AD-33 D-7).
     *
     * HMAC (HS*) configurations only: asymmetric configs hold a public
     * key for validation, not a signing key — external IdPs own issuance
     * there. With a user store wired, the account must exist, be enabled,
     * and the `ver` claim snapshots the store's CURRENT `tokenVersion`
     * (never a caller-supplied value).
     */
    async issueTokens(
        subject: TokenSubject
    ): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
        const secret = this.#signingSecret();
        const identity = this.#userStore
            ? await this.#storeIdentity(subject.id)
            : {
                  id: subject.id,
                  name: subject.name ?? subject.id,
                  roles: subject.roles ?? [],
                  tokenVersion: subject.tokenVersion ?? 0,
              };
        const now = Date.now();
        const accessToken = await this.#sign(
            {
                sub: identity.id,
                name: identity.name,
                roles: [...identity.roles],
                ver: identity.tokenVersion,
                token_use: 'access',
            },
            secret,
            now + this.#accessTtlMs
        );
        const refreshToken = await this.#sign(
            { sub: identity.id, ver: identity.tokenVersion, token_use: 'refresh' },
            secret,
            now + this.#refreshTtlMs
        );
        return { accessToken, refreshToken, expiresAt: now + this.#accessTtlMs };
    }

    /**
     * Rotates a refresh token (AD-33 D-7): issues a new access + refresh
     * pair AFTER advancing the account's `tokenVersion` — every older
     * token (access and refresh alike) is dead the moment a refresh lands,
     * so replaying a rotated-out refresh token is rejected by the version
     * comparison. No rotation ledger needed: the family moves forward.
     */
    async refresh(token: string): Promise<JWTRefreshResult> {
        const store = this.#userStoreOrThrow('refresh');
        let payload: JWTPayload;
        try {
            ({ payload } = await jwtVerify(token, await this.#resolveKey(), this.#verifyOptions()));
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
        // SEC-6: a compare-and-swap closes the check-then-bump TOCTOU. The
        // version advances only if it is still `payload.ver`; a concurrent
        // rotation that bumps it in between makes this refresh lose the race
        // (CAS returns null) instead of both refreshes succeeding.
        const nextVer = await store.incrementTokenVersionIfCurrent(user.id, payload.ver);
        if (nextVer === null) {
            throw new JWTTokenError('Refresh token superseded or revoked');
        }
        this.#cacheVersion(user.id, nextVer);
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
     * advancing `tokenVersion` (AD-33 D-7). The presented token (access
     * or refresh) must verify — an unverifiable token revokes nothing and
     * throws (fail closed).
     */
    async logout(token: string): Promise<void> {
        const store = this.#userStoreOrThrow('logout');
        let payload: JWTPayload;
        try {
            ({ payload } = await jwtVerify(token, await this.#resolveKey(), this.#verifyOptions()));
        } catch {
            throw new JWTTokenError('Invalid token');
        }
        if (typeof payload.sub !== 'string') {
            throw new JWTTokenError('Malformed token');
        }
        const nextVer = await store.incrementTokenVersion(payload.sub);
        this.#cacheVersion(payload.sub, nextVer);
    }

    #signingSecret(): Uint8Array {
        const algorithm = this.#config.algorithm;
        if (!algorithm.startsWith('HS') || !this.#config.secret) {
            throw new JWTTokenError(
                `Token issuance requires an HMAC secret (HS* algorithms); "${algorithm}" holds no signing key`
            );
        }
        return new TextEncoder().encode(this.#config.secret);
    }

    async #storeIdentity(id: string): Promise<{
        id: string;
        name: string;
        roles: readonly string[];
        tokenVersion: number;
    }> {
        const store = this.#userStore;
        if (store === undefined) {
            throw new JWTTokenError(
                'issueTokens requires a userStore — revocation is user-record token versioning (AD-33 D-7)'
            );
        }
        const user = await store.findById(id);
        if (!user || user.disabled === true) {
            throw new JWTTokenError(`Cannot issue tokens for user "${id}": unknown or disabled`);
        }
        return {
            id: user.id,
            name: user.username,
            roles: user.roles ?? [],
            tokenVersion: user.tokenVersion ?? 0,
        };
    }

    async #sign(payload: Record<string, unknown>, secret: Uint8Array, expiresAtMs: number): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: this.#config.algorithm })
            .setIssuer(this.#config.issuer)
            .setAudience(this.#config.audience)
            .setIssuedAt(Math.floor(Date.now() / 1000))
            .setExpirationTime(Math.floor(expiresAtMs / 1000))
            .sign(secret);
    }

    #userStoreOrThrow(flow: string): UserStore {
        if (!this.#userStore) {
            throw new JWTTokenError(
                `${flow} requires a userStore — revocation is user-record token versioning (AD-33 D-7)`
            );
        }
        return this.#userStore;
    }

    /**
     * Reads the account's current `tokenVersion` for the `ver` check,
     * honoring the short-TTL cache when configured. Returns `null` for an
     * unknown or disabled/deleted account (SE-7), failing validation closed;
     * a cache hit answers within `revocationCacheTtlMs`, so a disable takes
     * effect with the same bounded staleness as a version bump.
     */
    async #currentVersion(sub: string): Promise<number | null> {
        const ttl = this.#revocationCacheTtlMs;
        if (ttl > 0) {
            const hit = this.#versionCache.get(sub);
            if (hit && hit.expiresAt > Date.now()) return hit.version;
        }
        const store = this.#userStore;
        if (store === undefined) return null;
        const user = await store.findById(sub);
        const version = user === null || user.disabled === true ? null : (user.tokenVersion ?? 0);
        if (ttl > 0 && version !== null) {
            this.#pruneVersionCache();
            this.#versionCache.set(sub, { version, expiresAt: Date.now() + ttl });
        }
        return version;
    }

    #cacheVersion(sub: string, version: number): void {
        if (this.#revocationCacheTtlMs > 0) {
            this.#pruneVersionCache();
            this.#versionCache.set(sub, { version, expiresAt: Date.now() + this.#revocationCacheTtlMs });
        }
    }

    /**
     * Bounds {@link MAX_REVOCATION_CACHE_ENTRIES}: no-op below the cap; at the
     * cap, delete-on-sight sweep of expired entries, then oldest-first eviction
     * until the insert fits. Called before every cache write.
     */
    #pruneVersionCache(): void {
        if (this.#versionCache.size < MAX_REVOCATION_CACHE_ENTRIES) return;
        const now = Date.now();
        for (const [key, entry] of this.#versionCache) {
            if (entry.expiresAt <= now) {
                this.#versionCache.delete(key);
            }
        }
        while (this.#versionCache.size >= MAX_REVOCATION_CACHE_ENTRIES) {
            const oldest = this.#versionCache.keys().next();
            if (oldest.done) break;
            this.#versionCache.delete(oldest.value);
        }
    }
}

/**
 * Maps verified JWT claims to a {@link Principal}.
 *
 * @param payload - The verified JWT payload.
 * @returns The principal, or `null` when `sub` is absent or not a non-empty string.
 */
function principalFromPayload(payload: JWTPayload): Principal | null {
    const sub = payload.sub;
    if (typeof sub !== 'string' || sub.length === 0) {
        return null;
    }
    // SEC-AUD2-SEC-4/6: normalize the raw claim to strings ONCE and share the
    // result between the `roles` field and the predicates. Previously the field
    // stringified every element (`[["admin"]]` → `['admin']`) while the
    // predicates matched the raw elements, so a nested/non-string claim gave a
    // principal whose declared roles disagreed with `hasRole`/`hasAnyRole` —
    // a guard-vs-principal authorization mismatch. Filter (drop non-strings),
    // matching `ndigo-auth-client/oidc-adapter.ts`'s `readRoles`.
    const rawRoles = Array.isArray(payload.roles) ? (payload.roles as unknown[]) : [];
    const roles = rawRoles.filter((role): role is string => typeof role === 'string');
    return {
        id: sub,
        name: String(payload.name ?? payload.email ?? 'Unknown'),
        roles,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...asked: string[]) => asked.some((r) => roles.includes(r)),
    };
}
