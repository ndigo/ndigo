/**
 * The playground's authentication stack: two adapters (opaque cookie sessions
 * and JWTs) over one application-owned user store and one **durable** LibSQL
 * session store.
 *
 * Wiring is application-owned and happens before the container refreshes — the
 * same shape as `04-blue-api`'s `initAuth()` — because `AuthRegistry` is a
 * process-global seam: each adapter is registered under its own id
 * (`credentials`, `jwt`) and the routes select the scheme explicitly
 * (`AuthServer.validateAny` with an ordered adapter list, never "try them all"),
 * so a token minted for one scheme can never be accepted by the other.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    AuthRegistry,
    DelegatingPasswordEncoder,
    type PasswordEncoder,
    type Principal,
    type UserRecord,
} from '@blue/auth-core';
import { ScryptPasswordEncoder } from '@blue/auth-core/scrypt';
import { AuthServer, CredentialsAuthAdapter, InMemoryUserStore, JWTAdapter } from '@blue/auth-server';
import { LibSQLSessionStore } from '@blue/orm-drizzle';
import { DEMO_PASSWORD, FEDERATED_ROLES, type PlaygroundConfig } from './config';

/** Adapter id of the opaque-session credentials adapter. */
export const CREDENTIALS_ADAPTER_ID = 'credentials';

/** Adapter id of the JWT adapter. */
export const JWT_ADAPTER_ID = 'jwt';

/**
 * The ordered scheme list every guard validates against. Explicit and
 * fail-closed: an unregistered id throws rather than being skipped.
 */
export const AUTH_SCHEME_ORDER = [CREDENTIALS_ADAPTER_ID, JWT_ADAPTER_ID] as const;

/** The password-backed demo accounts (`admin` is admin-only, `alice` user-only). */
export const DEMO_ACCOUNTS = [
    { id: 'admin', username: 'admin', roles: ['admin'] },
    { id: 'alice', username: 'alice', roles: ['user'] },
] as const;

/** Live-session cap for the demo database (SEC-4: an unbounded map is a DoS). */
const MAX_SESSIONS = 256;

/** A session token with the expiry the store resolved for it. */
export interface IssuedSession {
    readonly token: string;
    readonly expiresAt: number;
}

/** Construction inputs for {@link AuthStack} (assigned by {@link AuthStack.create}). */
export interface AuthStackOptions {
    readonly config: PlaygroundConfig;
    readonly encoder: PasswordEncoder;
    readonly sessions: LibSQLSessionStore;
    readonly passwordHash: string;
}

/**
 * Ensures the parent directory of a `file:` database URL exists.
 *
 * `LibSQLSessionStore` creates the *table*, never the directory — a missing
 * directory would surface as a confusing first-use failure, so the playground
 * provisions it up front (and never touches a remote/`:memory:` URL).
 *
 * @param sessionDbUrl - The configured database URL.
 */
export function ensureSessionDirectory(sessionDbUrl: string): void {
    if (!sessionDbUrl.startsWith('file:')) return;
    mkdirSync(dirname(fileURLToPath(sessionDbUrl)), { recursive: true });
}

/**
 * The playground's auth wiring: user store, durable session store, both
 * adapters, the `AuthServer` that resolves them, and the session primitives the
 * OIDC and fixation demos need.
 */
export class AuthStack {
    /** The password encoder (`{scrypt}` hashes, self-describing parameters). */
    readonly encoder: PasswordEncoder;

    /** The application-owned user store. */
    readonly users: InMemoryUserStore;

    /** The durable opaque-session store (`blue_sessions` on LibSQL). */
    readonly sessions: LibSQLSessionStore;

    /** Username/password → opaque server session (mode 1). */
    readonly credentials: CredentialsAuthAdapter;

    /** Access + refresh JWTs with `ver`-claim revocation (mode 2). */
    readonly jwt: JWTAdapter;

    /** Adapter resolution for the guards (`validateAny` over {@link AUTH_SCHEME_ORDER}). */
    readonly server: AuthServer;

    readonly #config: PlaygroundConfig;

    constructor(options: AuthStackOptions) {
        this.#config = options.config;
        this.encoder = options.encoder;
        this.sessions = options.sessions;
        this.users = new InMemoryUserStore([
            {
                id: DEMO_ACCOUNTS[0].id,
                username: DEMO_ACCOUNTS[0].username,
                roles: [...DEMO_ACCOUNTS[0].roles],
                passwordHash: options.passwordHash,
                tokenVersion: 0,
            },
            {
                id: DEMO_ACCOUNTS[1].id,
                username: DEMO_ACCOUNTS[1].username,
                roles: [...DEMO_ACCOUNTS[1].roles],
                passwordHash: options.passwordHash,
                tokenVersion: 0,
            },
            {
                // Federated account: no password hash, so the credentials adapter
                // can never authenticate it — it is reachable *only* through the
                // embedded OIDC issuer (mode 6). It still exists as an account so
                // the sessions issued for it resolve (SE-7 account check).
                id: options.config.oidc.accountId,
                username: options.config.oidc.accountId,
                roles: [...FEDERATED_ROLES],
                passwordHash: null,
                tokenVersion: 0,
            },
        ]);
        this.credentials = new CredentialsAuthAdapter({
            userStore: this.users,
            passwordEncoder: options.encoder,
            // The durable store — sessions survive a process restart.
            sessionStore: this.sessions,
            sessionTtlMs: options.config.sessionTtlMs,
        });
        this.jwt = new JWTAdapter({
            issuer: options.config.jwt.issuer,
            audience: options.config.jwt.audience,
            algorithm: 'HS256',
            secret: options.config.jwt.secret,
            userStore: this.users,
            accessTokenTtlMs: options.config.jwt.accessTtlMs,
            refreshTokenTtlMs: options.config.jwt.refreshTtlMs,
        });
        this.server = new AuthServer();
        // Process-global registration (the framework seam): the last stack
        // created in a process owns both adapter ids.
        AuthRegistry.register(this.credentials);
        AuthRegistry.register(this.jwt);
    }

    /**
     * Builds the stack: provisions the demo accounts (scrypt-hashed) and the
     * durable session table, then registers both adapters.
     *
     * @param config - The resolved configuration.
     * @returns The ready-to-use stack.
     */
    static async create(config: PlaygroundConfig): Promise<AuthStack> {
        ensureSessionDirectory(config.sessionDbUrl);
        const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder() }, 'scrypt');
        const sessions = new LibSQLSessionStore({ url: config.sessionDbUrl, maxSessions: MAX_SESSIONS });
        // Explicit provisioning (AD-40): creates `blue_sessions` + its expiry
        // index, idempotently, and never touches other tables.
        await sessions.initialize();
        return new AuthStack({ config, encoder, sessions, passwordHash: encoder.encode(DEMO_PASSWORD) });
    }

    /**
     * Verifies a username/password pair against the user store.
     *
     * This is the JWT mode's first-party credential check: it answers the
     * *account* (mode 2 issues tokens) where
     * {@link AuthStack.credentials} answers a session (mode 1). Failures are one
     * generic denial — unknown user, wrong password, disabled account and
     * password-less accounts are indistinguishable to the caller. The
     * credentials adapter remains the reference path: it additionally runs a
     * dummy-hash verification for unknown users to equalize timing.
     *
     * @param username - The submitted username.
     * @param password - The submitted password.
     * @returns The account record, or `null` when the credentials do not verify.
     */
    async verifyPassword(username: string, password: string): Promise<UserRecord | null> {
        const user = await this.users.findByUsername(username);
        const stored = typeof user?.passwordHash === 'string' && user.passwordHash !== '' ? user.passwordHash : null;
        if (user === null || stored === null || user.disabled === true) {
            return null;
        }
        return this.encoder.verify(password, stored) ? user : null;
    }

    /**
     * Issues an opaque session for a principal that authenticated *elsewhere*
     * (the OIDC mode) — the same durable store, the same cookie, the same
     * downstream `/auth/me`.
     *
     * Fail-closed: the principal must map to a known, enabled account, so a
     * federated identity that has no application account cannot obtain a
     * session.
     *
     * @param principal - The externally authenticated principal.
     * @returns The opaque session id and its absolute expiry.
     */
    async issueSession(principal: Principal): Promise<IssuedSession> {
        const account = await this.#requireAccount(principal.id);
        const token = await this.sessions.create(
            { principal, tokenVersion: account.tokenVersion ?? 0, issuedAt: Date.now() },
            this.#config.sessionTtlMs
        );
        return { token, expiresAt: Date.now() + this.#config.sessionTtlMs };
    }

    /**
     * Rotates a session id while keeping (or changing) the record — the
     * session-fixation primitive (`SessionStore.rotate`): exactly one
     * contender replaces the live id, the old id stops working immediately,
     * and the store's absolute expiry is preserved.
     *
     * @param sessionId - The current (live) session id.
     * @param principal - The principal the new session should carry.
     * @returns The new session id and its effective expiry.
     */
    async rotateSession(sessionId: string, principal: Principal): Promise<IssuedSession> {
        const account = await this.#requireAccount(principal.id);
        const rotated = await this.sessions.rotate(sessionId, {
            principal,
            tokenVersion: account.tokenVersion ?? 0,
            issuedAt: Date.now(),
        });
        return { token: rotated.id, expiresAt: rotated.expiresAt };
    }

    /** Closes the durable store (owned LibSQL client). */
    close(): void {
        this.sessions.dispose();
    }

    /** Resolves the live account for a principal, failing closed when absent. */
    async #requireAccount(id: string): Promise<UserRecord> {
        const account = await this.users.findById(id);
        if (account === null || account.disabled === true) {
            throw new Error(`No enabled account for principal "${id}"`);
        }
        return account;
    }
}
