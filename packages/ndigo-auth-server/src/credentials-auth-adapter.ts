/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    type AuthAdapter,
    type AuthResult,
    type PasswordEncoder,
    type Principal,
    type SessionStore,
    type UserStore,
    DefaultPrincipal,
} from '@ndigo/auth-core';
import { ApplicationError } from '@ndigo/core';

/**
 * Credential shape the adapter authenticates: `{ username, password }`.
 */
export interface Credentials {
    readonly username: string;
    readonly password: string;
}

/**
 * Options for {@link CredentialsAuthAdapter}.
 */
export interface CredentialsAuthAdapterOptions {
    /** First-party user lookup (app-owned store, typically over `ndigo-orm`). */
    userStore: UserStore;
    /** Hash verifier/encoder (`DelegatingPasswordEncoder` for multi-scheme). */
    passwordEncoder: PasswordEncoder;
    /** Backing store for the issued opaque sessions. */
    sessionStore: SessionStore;
    /** Session lifetime in milliseconds (default 30 minutes). */
    sessionTtlMs?: number;
}

const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000;

/**
 * One generic denial for every failure mode — wrong password, unknown
 * user, disabled account, malformed credentials — so responses never
 * leak which condition failed (no user enumeration via error text).
 */
export class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super('Invalid credentials');
        this.name = 'InvalidCredentialsError';
    }
}

/**
 * The first-party credential authentication adapter (AD-33 D-5):
 * username/password → opaque server session.
 *
 * Implements the existing {@link AuthAdapter} seam unchanged, so it plugs
 * into `AuthRegistry`/`AuthServer.validateAny` and the fail-closed
 * explicit-scheme discipline without framework changes:
 *
 * - `authenticate` — `UserStore.findByUsername` + `PasswordEncoder.verify`,
 *   with a **dummy-hash verify on unknown users** equalizing timing and
 *   preventing user enumeration; disabled accounts and accounts without a
 *   hash never authenticate; success issues an opaque session token —
 *   **the token is the id issued by the `SessionStore`** (single source of
 *   truth for session keys; `InMemorySessionStore` uses 32-byte
 *   `randomBytes` tokens).
 * - `validate` — `SessionStore.get` **plus a live account check** (`SE-7`),
 *   or `null` (expired/unknown/revoked session, or a disabled/deleted
 *   account): disabling an account revokes its outstanding opaque sessions
 *   at the next validation.
 * - `refresh` — session **rotation**: new id, old id dead (fixation-safe);
 *   a disabled or deleted account cannot rotate.
 * - `logout` — session delete (single device).
 * - `logoutAll` — user-wide revocation (AD-68): every live session of the
 *   account is deleted and its `tokenVersion` advances, which also kills
 *   every outstanding JWT the `JWTAdapter` issued for the account.
 *
 * The rehash-on-login migration hook (`needsRehash`) is consumed at the
 * application layer (the `UserStore` contract has no password write in
 * v1 — see the auth completion plan, Wave 5 hardening).
 */
export class CredentialsAuthAdapter implements AuthAdapter {
    readonly id = 'credentials';

    readonly #userStore: UserStore;
    readonly #passwordEncoder: PasswordEncoder;
    readonly #sessionStore: SessionStore;
    readonly #sessionTtlMs: number;
    #dummyHash: string | null = null;

    constructor(options: CredentialsAuthAdapterOptions) {
        this.#userStore = options.userStore;
        this.#passwordEncoder = options.passwordEncoder;
        this.#sessionStore = options.sessionStore;
        this.#sessionTtlMs = options.sessionTtlMs ?? DEFAULT_SESSION_TTL_MS;
    }

    async authenticate(credentials: unknown): Promise<AuthResult> {
        if (!isCredentials(credentials)) {
            throw new InvalidCredentialsError();
        }
        const { username, password } = credentials;
        const user = await this.#userStore.findByUsername(username);
        // SEC-B1: the dummy hash is a timing sink only — it must never
        // authenticate. `stored` is the account's real hash when it is a
        // non-empty string, else `null` (null/undefined/empty hash all fail
        // closed). The verify still runs against the dummy constant on that
        // path so unknown/no-hash users cost the same as a real account.
        const stored =
            typeof user?.passwordHash === 'string' && user.passwordHash.length > 0 ? user.passwordHash : null;
        const valid = this.#passwordEncoder.verify(password, stored ?? this.#dummyHashValue());
        if (!valid || user === null || stored === null || user.disabled === true) {
            throw new InvalidCredentialsError();
        }

        const principal = new DefaultPrincipal(user.id, user.username, user.roles ?? []);
        const issuedAt = Date.now();
        const token = await this.#sessionStore.create(
            { principal, tokenVersion: user.tokenVersion ?? 0, issuedAt },
            this.#sessionTtlMs
        );
        return { principal, token, expiresAt: issuedAt + this.#sessionTtlMs };
    }

    async validate(token: string): Promise<Principal | null> {
        const record = await this.#sessionStore.get(token);
        if (!record) {
            return null;
        }
        // SE-7: sessions outlive account-state changes — consult the account
        // record so disabling (or deleting) an account revokes its live
        // sessions instead of leaving them valid until TTL expiry.
        const user = await this.#userStore.findById(record.principal.id);
        if (user === null || user.disabled === true) {
            return null;
        }
        return record.principal;
    }

    async refresh(token: string): Promise<AuthResult> {
        const record = await this.#sessionStore.get(token);
        if (!record) {
            throw new InvalidCredentialsError();
        }
        // SE-7 parity: a disabled or deleted account must not be able to
        // rotate a session, even though the rotated token would then fail
        // validation — reject at the source.
        const user = await this.#userStore.findById(record.principal.id);
        if (user === null || user.disabled === true) {
            throw new InvalidCredentialsError();
        }
        const issuedAt = Date.now();
        // COR-13: report the store's effective expiry (rotate preserves the
        // remaining TTL), never a fresh `issuedAt + ttlMs`.
        const next = await this.#sessionStore.rotate(token, { ...record, issuedAt });
        return { principal: record.principal, token: next.id, expiresAt: next.expiresAt };
    }

    async logout(token: string): Promise<void> {
        await this.#sessionStore.delete(token);
    }

    /**
     * Revokes every live credential of the account (AD-68): deletes all of
     * its opaque sessions and advances its `tokenVersion`, which invalidates
     * every outstanding JWT issued for the account by `JWTAdapter`. Sessions
     * are removed first so a failing version bump can never leave tokens
     * dead while sessions stay alive.
     *
     * @param userId - The account's stable id (`principal.id`).
     * @returns The number of live sessions removed and the new token version.
     * @throws When the account is unknown (`UserStore.incrementTokenVersion`
     *   fails closed).
     */
    async logoutAll(userId: string): Promise<{ sessions: number; tokenVersion: number }> {
        const sessions = await this.#sessionStore.deleteForUser(userId);
        const tokenVersion = await this.#userStore.incrementTokenVersion(userId);
        return { sessions, tokenVersion };
    }

    /**
     * Lazy precomputed hash for unknown-user timing equalization: one
     * scrypt derivation at first use, then verified against on every
     * unknown-username attempt — same cost curve as a real account.
     */
    #dummyHashValue(): string {
        this.#dummyHash ??= this.#passwordEncoder.encode('ndigo-dummy-password-for-timing-equalization');
        return this.#dummyHash;
    }
}

function isCredentials(value: unknown): value is Credentials {
    if (typeof value !== 'object' || value === null) return false;
    const { username, password } = value as Record<string, unknown>;
    return typeof username === 'string' && typeof password === 'string';
}
