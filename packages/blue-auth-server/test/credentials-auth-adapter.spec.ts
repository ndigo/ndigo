/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import {
    type UserRecord,
    type UserStore,
    DelegatingPasswordEncoder,
    ScryptPasswordEncoder,
    DefaultPrincipal,
} from '@blue/auth-core';
import { delay } from '@blue/test';
import { CredentialsAuthAdapter, InvalidCredentialsError } from '../src/credentials-auth-adapter';
import { InMemorySessionStore } from '../src/in-memory-session-store';
import { JWTAdapter } from '../src/jwt-adapter';

/** Fast test-cost scrypt (ln=14 ≈ 16 MiB) — parameter drift is not under test here. */
const encoder = new DelegatingPasswordEncoder({ scrypt: new ScryptPasswordEncoder({ ln: 14 }) }, 'scrypt');

/**
 * Authenticates and narrows the session token to a string — the adapter
 * contract leaves `token` nullable, but a successful authenticate here
 * always minted one (asserted, then cast).
 */
async function sessionToken(adapter: CredentialsAuthAdapter, username: string, password: string): Promise<string> {
    const result = await adapter.authenticate({ username, password });
    expect(result.token).toBeTypeOf('string');
    return result.token as string;
}

class StubUserStore implements UserStore {
    readonly #users = new Map<string, UserRecord>();

    constructor(users: readonly UserRecord[]) {
        for (const user of users) {
            this.#users.set(user.username, user);
        }
    }

    /** Test helper: flips the account's `disabled` flag (SE-7). */
    disable(id: string): void {
        const user = this.#byId(id);
        if (user === null) throw new Error(`User "${id}" not found`);
        this.#users.set(user.username, { ...user, disabled: true });
    }

    /** Test helper: removes the account (deleted-account revocation, SE-7). */
    remove(id: string): void {
        const user = this.#byId(id);
        if (user === null) throw new Error(`User "${id}" not found`);
        this.#users.delete(user.username);
    }

    async findByUsername(username: string): Promise<UserRecord | null> {
        return this.#users.get(username) ?? null;
    }

    async findById(id: string): Promise<UserRecord | null> {
        return this.#byId(id);
    }

    async incrementTokenVersion(id: string): Promise<number> {
        const user = this.#byId(id);
        if (user === null) throw new Error(`User "${id}" not found`);
        const next = (user.tokenVersion ?? 0) + 1;
        this.#users.set(user.username, { ...user, tokenVersion: next });
        return next;
    }

    async incrementTokenVersionIfCurrent(id: string, expected: number): Promise<number | null> {
        const user = this.#byId(id);
        if (user === null) throw new Error(`User "${id}" not found`);
        if ((user.tokenVersion ?? 0) !== expected) return null;
        const next = expected + 1;
        this.#users.set(user.username, { ...user, tokenVersion: next });
        return next;
    }

    #byId(id: string): UserRecord | null {
        for (const user of this.#users.values()) {
            if (user.id === id) return user;
        }
        return null;
    }
}

function buildAdapter(options: { sessionTtlMs?: number } = {}) {
    const store = new InMemorySessionStore();
    const users = new StubUserStore([
        {
            id: 'alice',
            username: 'alice',
            passwordHash: encoder.encode('s3cret'),
            roles: ['user'],
        },
        {
            id: 'bob',
            username: 'bob',
            passwordHash: encoder.encode('hunter2'),
            disabled: true,
        },
        { id: 'claire', username: 'claire', passwordHash: null },
        { id: 'dave', username: 'dave', passwordHash: encoder.encode('davepass'), roles: ['user'] },
    ]);
    const adapter = new CredentialsAuthAdapter({
        userStore: users,
        passwordEncoder: encoder,
        sessionStore: store,
        sessionTtlMs: options.sessionTtlMs ?? 60_000,
    });
    return { store, users, adapter };
}

const INVALID = 'Invalid credentials';

describe('CredentialsAuthAdapter', () => {
    test('adapter id is credentials', () => {
        expect(buildAdapter().adapter.id).toBe('credentials');
    });

    test('authenticates valid credentials to an AuthResult with an opaque token', async () => {
        const { adapter } = buildAdapter();
        const result = await adapter.authenticate({ username: 'alice', password: 's3cret' });
        expect(result.principal).toBeInstanceOf(DefaultPrincipal);
        expect(result.principal?.id).toBe('alice');
        expect(result.principal?.name).toBe('alice');
        expect(result.principal?.roles).toEqual(['user']);
        const token = result.token as string;
        expect(token).toBeTypeOf('string');
        expect(token.length).toBeGreaterThan(0);
        expect(result.expiresAt).toBeGreaterThan(Date.now());
    });

    test('rejects a wrong password with InvalidCredentialsError', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.authenticate({ username: 'alice', password: 'wrong' })).rejects.toBeInstanceOf(
            InvalidCredentialsError
        );
    });

    test('unknown user gets the identical error message as a wrong password', async () => {
        const { adapter } = buildAdapter();
        const unknown = await adapter.authenticate({ username: 'nobody', password: 'x' }).catch((e: unknown) => e);
        const wrong = await adapter.authenticate({ username: 'alice', password: 'x' }).catch((e: unknown) => e);
        expect(unknown).toBeInstanceOf(InvalidCredentialsError);
        expect(wrong).toBeInstanceOf(InvalidCredentialsError);
        expect((unknown as Error).message).toBe((wrong as Error).message);
        expect((unknown as Error).message).toBe(INVALID);
    });

    test('disabled accounts never authenticate', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.authenticate({ username: 'bob', password: 'hunter2' })).rejects.toBeInstanceOf(
            InvalidCredentialsError
        );
    });

    test('accounts without a password hash never match', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.authenticate({ username: 'claire', password: '' })).rejects.toBeInstanceOf(
            InvalidCredentialsError
        );
    });

    test('malformed credentials fail closed', async () => {
        const { adapter } = buildAdapter();
        const cases = [null, undefined, 42, 'alice', {}, { username: 'alice' }, { username: 'alice', password: 7 }];
        await Promise.all(
            cases.map((credentials) =>
                expect(adapter.authenticate(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError)
            )
        );
    });

    test('validate returns the principal for a live session and null otherwise', async () => {
        const { adapter } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');
        await expect(adapter.validate(token)).resolves.toMatchObject({ id: 'alice' });
        await expect(adapter.validate('unknown')).resolves.toBeNull();
    });

    test('a live session is revoked when its account is disabled (SE-7)', async () => {
        const { adapter, users } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');
        await expect(adapter.validate(token)).resolves.toMatchObject({ id: 'alice' });

        users.disable('alice');
        // The opaque session record still exists — the account check is what
        // revokes it (no user-wide revocation API needed for the disable case).
        await expect(adapter.validate(token)).resolves.toBeNull();
    });

    test('a live session is revoked when its account is deleted (SE-7)', async () => {
        const { adapter, users } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');

        users.remove('alice');
        await expect(adapter.validate(token)).resolves.toBeNull();
    });

    test('refresh rotates the session: new token works, old one is dead', async () => {
        const { adapter } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');
        const refreshed = await adapter.refresh(token);
        expect(refreshed.token).not.toBe(token);
        expect(refreshed.principal).toMatchObject({ id: 'alice' });
        await expect(adapter.validate(token)).resolves.toBeNull();
        await expect(adapter.validate(refreshed.token)).resolves.toMatchObject({ id: 'alice' });
    });

    test('refresh fails closed on an unknown token', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.refresh('nope')).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    test('refresh rejects a disabled account (SE-7 parity)', async () => {
        const { adapter, users } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');
        users.disable('alice');
        await expect(adapter.refresh(token)).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    test('logoutAll deletes every live session of the account and advances tokenVersion (SE-7)', async () => {
        const { adapter } = buildAdapter();
        const first = await sessionToken(adapter, 'alice', 's3cret');
        const second = await sessionToken(adapter, 'alice', 's3cret');
        const other = await sessionToken(adapter, 'dave', 'davepass');

        await expect(adapter.logoutAll('alice')).resolves.toEqual({ sessions: 2, tokenVersion: 1 });
        await expect(adapter.validate(first)).resolves.toBeNull();
        await expect(adapter.validate(second)).resolves.toBeNull();
        // Other accounts are untouched.
        await expect(adapter.validate(other)).resolves.toMatchObject({ id: 'dave' });
        // Idempotent: nothing left to delete, the version keeps advancing.
        await expect(adapter.logoutAll('alice')).resolves.toEqual({ sessions: 0, tokenVersion: 2 });
    });

    test('logoutAll revokes outstanding JWTs of the account through the shared user store (AD-68)', async () => {
        const { adapter, users } = buildAdapter();
        const jwt = new JWTAdapter({
            issuer: 'https://auth.example.com',
            audience: 'app',
            algorithm: 'HS256',
            secret: 'close-out-secret-0123456789abcdefghij',
            userStore: users,
        });
        const issued = await jwt.issueTokens({ id: 'alice' });
        await expect(jwt.validate(issued.accessToken)).resolves.toMatchObject({ id: 'alice' });

        await adapter.logoutAll('alice');

        await expect(jwt.validate(issued.accessToken)).resolves.toBeNull();
        await expect(jwt.refresh(issued.refreshToken)).rejects.toBeInstanceOf(Error);
    });

    test('logoutAll fails closed for an unknown account', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.logoutAll('ghost')).rejects.toThrow(/not found/i);
    });

    test("refresh reports the store's effective expiry, not a fresh full TTL (COR-13)", async () => {
        const { adapter } = buildAdapter({ sessionTtlMs: 60_000 });
        const authenticated = await adapter.authenticate({ username: 'alice', password: 's3cret' });
        const token = authenticated.token as string;
        // Burn most of the TTL: rotating must preserve the remaining window.
        await delay(50);
        const refreshed = await adapter.refresh(token);
        // The reported expiry preserves the original session's absolute
        // expiry (within a few ms of clock drift) instead of `issuedAt + ttl`.
        expect(refreshed.expiresAt).toBeGreaterThanOrEqual(authenticated.expiresAt - 5);
        expect(refreshed.expiresAt).toBeLessThanOrEqual(authenticated.expiresAt + 5);
        // …and the refreshed session is actually live with that expiry, still
        // well short of the 50ms-already-elapsed full TTL would be.
        expect(await adapter.validate(refreshed.token)).toMatchObject({ id: 'alice' });
    });

    test('logout invalidates the session', async () => {
        const { adapter } = buildAdapter();
        const token = await sessionToken(adapter, 'alice', 's3cret');
        await adapter.logout(token);
        await expect(adapter.validate(token)).resolves.toBeNull();
    });

    test('sessions expire at the configured TTL', async () => {
        const { adapter } = buildAdapter({ sessionTtlMs: 20 });
        const token = await sessionToken(adapter, 'alice', 's3cret');
        await delay(40);
        await expect(adapter.validate(token)).resolves.toBeNull();
    });
});
