/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    type UserRecord,
    type UserStore,
    DelegatingPasswordEncoder,
    ScryptPasswordEncoder,
    DefaultPrincipal,
} from '@blue/auth-core';
import { CredentialsAuthAdapter, InvalidCredentialsError } from '../src/credentials-auth-adapter';
import { InMemorySessionStore } from '../src/in-memory-session-store';

/** Test-only delay helper (Promise.withResolvers pattern). */
function delay(ms: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
}

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

    async findByUsername(username: string): Promise<UserRecord | null> {
        return this.#users.get(username) ?? null;
    }

    async findById(id: string): Promise<UserRecord | null> {
        for (const user of this.#users.values()) {
            if (user.id === id) return user;
        }
        return null;
    }

    async incrementTokenVersion(id: string): Promise<number> {
        for (const user of this.#users.values()) {
            if (user.id !== id) continue;
            const next = (user.tokenVersion ?? 0) + 1;
            this.#users.set(user.username, { ...user, tokenVersion: next });
            return next;
        }
        throw new Error(`User "${id}" not found`);
    }
}

function buildAdapter(options: { sessionTtlMs?: number } = {}) {
    const store = new InMemorySessionStore();
    const adapter = new CredentialsAuthAdapter({
        userStore: new StubUserStore([
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
        ]),
        passwordEncoder: encoder,
        sessionStore: store,
        sessionTtlMs: options.sessionTtlMs ?? 60_000,
    });
    return { store, adapter };
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
