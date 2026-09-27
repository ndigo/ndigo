/**
 * @module blue-auth-server
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
} from '@blue/auth-core';

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
    /** First-party user lookup (app-owned store, typically over `blue-orm`). */
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
export class InvalidCredentialsError extends Error {
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
 * - `validate` — `SessionStore.get`, or `null` (expired/unknown/revoked).
 * - `refresh` — session **rotation**: new id, old id dead (fixation-safe).
 * - `logout` — session delete.
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
        const hash = user?.passwordHash ?? this.#dummyHashValue();
        const valid = this.#passwordEncoder.verify(password, hash);
        if (!valid || user === null || user.disabled === true) {
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
        return record?.principal ?? null;
    }

    async refresh(token: string): Promise<AuthResult> {
        const record = await this.#sessionStore.get(token);
        if (!record) {
            throw new InvalidCredentialsError();
        }
        const issuedAt = Date.now();
        const next = await this.#sessionStore.rotate(token, { ...record, issuedAt });
        return { principal: record.principal, token: next, expiresAt: issuedAt + this.#sessionTtlMs };
    }

    async logout(token: string): Promise<void> {
        await this.#sessionStore.delete(token);
    }

    /**
     * Lazy precomputed hash for unknown-user timing equalization: one
     * scrypt derivation at first use, then verified against on every
     * unknown-username attempt — same cost curve as a real account.
     */
    #dummyHashValue(): string {
        this.#dummyHash ??= this.#passwordEncoder.encode('bluejs-dummy-password-for-timing-equalization');
        return this.#dummyHash;
    }
}

function isCredentials(value: unknown): value is Credentials {
    if (typeof value !== 'object' || value === null) return false;
    const { username, password } = value as Record<string, unknown>;
    return typeof username === 'string' && typeof password === 'string';
}
