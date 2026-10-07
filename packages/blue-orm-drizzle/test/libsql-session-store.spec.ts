/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DefaultPrincipal, type SessionRecord } from '@blue/auth-core';
import { ScryptPasswordEncoder } from '@blue/auth-core/scrypt';
import { CredentialsAuthAdapter, InMemoryUserStore } from '@blue/auth-server';
import { GenericApplicationContext } from '@blue/context';
import { LibSQLSessionStore } from '../src/index';

const stores: LibSQLSessionStore[] = [];
const clients: Client[] = [];
const directories: string[] = [];
afterEach(async () => {
    vi.restoreAllMocks();
    for (const store of stores) store.close();
    for (const client of clients) client.close();
    for (const directory of directories) {
        // oxlint-disable-next-line no-await-in-loop -- isolated file handles must be released before directory cleanup.
        await rm(directory, { recursive: true, force: true });
    }
    stores.length = clients.length = directories.length = 0;
});

const record = (issuedAt = Date.now()): SessionRecord => ({
    principal: new DefaultPrincipal('alice', 'Alice', ['user', 'editor']),
    tokenVersion: 3,
    issuedAt,
});

async function openStore(maxSessions?: number): Promise<{ store: LibSQLSessionStore; client: Client }> {
    const client = createClient({ url: ':memory:' });
    clients.push(client);
    const store = new LibSQLSessionStore({ client, maxSessions });
    stores.push(store);
    await store.initialize();
    return { store, client };
}

async function fileStores(): Promise<{ first: LibSQLSessionStore; second: LibSQLSessionStore; url: string }> {
    const directory = await mkdtemp(join(tmpdir(), 'blue-session-'));
    directories.push(directory);
    const url = `file:${join(directory, 'sessions.db')}`;
    const first = new LibSQLSessionStore({ url });
    const second = new LibSQLSessionStore({ url });
    stores.push(first, second);
    await first.initialize();
    await second.initialize();
    return { first, second, url };
}

function adapter(store: LibSQLSessionStore): CredentialsAuthAdapter {
    const encoder = new ScryptPasswordEncoder({ ln: 14 });
    return new CredentialsAuthAdapter({
        userStore: new InMemoryUserStore([
            {
                id: 'alice',
                username: 'alice',
                roles: ['user'],
                tokenVersion: 3,
                passwordHash: encoder.encode('secret'),
            },
        ]),
        passwordEncoder: encoder,
        sessionStore: store,
        sessionTtlMs: 60_000,
    });
}

describe('LibSQLSessionStore', () => {
    test('provisioning is explicit and never drops unrelated application tables', async () => {
        const client = createClient({ url: ':memory:' });
        clients.push(client);
        await client.execute('CREATE TABLE app_notes (body TEXT)');
        await client.execute("INSERT INTO app_notes VALUES ('keep')");
        const store = new LibSQLSessionStore({ client });
        stores.push(store);
        await expect(store.get('missing')).rejects.toThrow(/no such table/i);
        await store.initialize();
        await store.initialize();
        expect((await client.execute('SELECT body FROM app_notes')).rows[0]?.[0]).toBe('keep');
        expect(await store.get('missing')).toBeNull();
        await expect(store.rotate('missing', record())).rejects.toThrow(/not found/i);
        await store.delete('missing');
    });

    test('independent clients see creates, atomic rotation and revocation', async () => {
        const { first, second } = await fileStores();
        const original = record();
        const id = await first.create(original, 60_000);
        expect(id).toMatch(/^[A-Za-z0-9_-]{43}$/);
        const read = await second.get(id);
        expect(read).toEqual(original);
        expect(read?.principal.hasRole('editor')).toBe(true);
        expect(read?.principal.hasAnyRole('missing', 'user')).toBe(true);
        const nextRecord = record(original.issuedAt + 100);
        const outcomes = await Promise.allSettled([first.rotate(id, nextRecord), second.rotate(id, nextRecord)]);
        const winners = outcomes.filter((outcome) => outcome.status === 'fulfilled');
        expect(winners).toHaveLength(1);
        expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(1);
        if (winners[0]?.status !== 'fulfilled') throw new Error('No rotation winner');
        expect(await first.get(id)).toBeNull();
        expect(await second.get(winners[0].value.id)).toEqual(nextRecord);
        await first.delete(winners[0].value.id);
        expect(await second.get(winners[0].value.id)).toBeNull();
        await second.delete(winners[0].value.id);
    });

    test('deleteForUser removes every live session of one account and reports the count (AD-68)', async () => {
        const { store } = await openStore();
        const alice = record();
        const bob = { ...record(), principal: new DefaultPrincipal('bob', 'Bob', ['user']) };
        const aliceSessions = await Promise.all([store.create(alice, 60_000), store.create(alice, 60_000)]);
        const bobSession = await store.create(bob, 60_000);

        await expect(store.deleteForUser('alice')).resolves.toBe(2);
        await expect(store.get(aliceSessions[0])).resolves.toBeNull();
        await expect(store.get(aliceSessions[1])).resolves.toBeNull();
        await expect(store.get(bobSession)).resolves.toEqual(bob);
        // Idempotent for an account with nothing left.
        await expect(store.deleteForUser('alice')).resolves.toBe(0);
    });

    test('session identity and role methods survive closing and reopening a real file', async () => {
        const { first, second, url } = await fileStores();
        const original = record();
        const id = await first.create(original, 60_000);
        first.close();
        second.close();
        const reopened = new LibSQLSessionStore({ url });
        stores.push(reopened);
        const read = await reopened.get(id);
        expect(read).toEqual(original);
        expect(read?.principal.hasRole('user')).toBe(true);
        await reopened.delete(id);
        expect(await reopened.get(id)).toBeNull();
    });

    test('expiry boundary purges reads and direct expired rotation cannot resurrect an id', async () => {
        const { store, client } = await openStore();
        const readId = await store.create(record(), 60_000);
        const rotateId = await store.create(record(), 60_000);
        const now = Date.now();
        await client.execute({ sql: 'UPDATE blue_sessions SET expires_at = ?', args: [now] });
        vi.spyOn(Date, 'now').mockReturnValue(now);
        expect(await store.get(readId)).toBeNull();
        await expect(store.rotate(rotateId, record())).rejects.toThrow(/expired/i);
        expect((await client.execute('SELECT COUNT(*) FROM blue_sessions')).rows[0]?.[0]).toBe(0);
    });

    test('rotation preserves and reports exact remaining absolute expiry', async () => {
        const { store, client } = await openStore();
        const id = await store.create(record(), 60_000);
        const expiresAt = Date.now() + 2000;
        await client.execute({
            sql: 'UPDATE blue_sessions SET expires_at = ? WHERE session_id = ?',
            args: [expiresAt, id],
        });
        const next = await store.rotate(id, record());
        expect(next.expiresAt).toBe(expiresAt);
        expect(
            (
                await client.execute({
                    sql: 'SELECT expires_at FROM blue_sessions WHERE session_id = ?',
                    args: [next.id],
                })
            ).rows[0]?.[0]
        ).toBe(expiresAt);
    });

    test('capacity rejects extra live sessions and reclaims expired rows', async () => {
        const { store, client } = await openStore(1);
        const first = await store.create(record(), 60_000);
        await expect(store.create(record(), 60_000)).rejects.toThrow(/capacity/i);
        await client.execute({
            sql: 'UPDATE blue_sessions SET expires_at = ? WHERE session_id = ?',
            args: [Date.now() - 1, first],
        });
        const next = await store.create(record(), 60_000);
        expect(await store.get(first)).toBeNull();
        expect((await store.get(next))?.principal.id).toBe('alice');
    });

    test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.5])(
        'invalid TTL %s cannot persist a session',
        async (ttl) => {
            const { store, client } = await openStore();
            await expect(store.create(record(), ttl)).rejects.toThrow(RangeError);
            expect((await client.execute('SELECT COUNT(*) FROM blue_sessions')).rows[0]?.[0]).toBe(0);
        }
    );

    test.each([
        ['roles', '{bad-json'],
        ['roles', '{}'],
        ['roles', '["user",1]'],
        ['token_version', 'bad'],
        ['issued_at', 'bad'],
        ['expires_at', 'bad'],
    ])('corrupt %s fails closed without revoking or replacing the session', async (column, value) => {
        const { store, client } = await openStore();
        const id = await store.create(record(), 60_000);
        // Column comes only from the fixed test cases, never from a consumer.
        await client.execute({ sql: `UPDATE blue_sessions SET ${column} = ? WHERE session_id = ?`, args: [value, id] });
        await expect(store.get(id)).rejects.toThrow(/malformed/i);
        await expect(store.rotate(id, record())).rejects.toThrow(/malformed/i);
        expect((await client.execute({ sql: 'SELECT session_id FROM blue_sessions', args: [] })).rows[0]?.[0]).toBe(id);
    });

    test('database errors remain errors and a failed rotation retains the old identity', async () => {
        const { store, client } = await openStore();
        const id = await store.create(record(), 60_000);
        await client.execute(`CREATE TRIGGER reject_session_rotation BEFORE UPDATE ON blue_sessions
            BEGIN SELECT RAISE(ABORT, 'rotation denied'); END`);
        await expect(store.rotate(id, record())).rejects.toThrow(/rotation denied/i);
        expect((await store.get(id))?.principal.id).toBe('alice');
        client.close();
        await expect(store.get(id)).rejects.toThrow(/closed/i);
        await expect(store.create(record(), 60_000)).rejects.toThrow(/closed/i);
        await expect(store.rotate(id, record())).rejects.toThrow(/closed/i);
        await expect(store.delete(id)).rejects.toThrow(/closed/i);
        await expect(store.initialize()).rejects.toThrow(/closed/i);
    });

    test('explicit schema errors reject rather than constructing a memory fallback', async () => {
        const client = createClient({ url: ':memory:' });
        clients.push(client);
        await client.execute('CREATE VIEW blue_sessions AS SELECT 1 AS session_id');
        const store = new LibSQLSessionStore({ client });
        stores.push(store);
        await expect(store.initialize()).rejects.toThrow();
        await expect(store.create(record(), 60_000)).rejects.toThrow();
    });

    test('container shutdown closes transferred clients once; borrowed clients remain usable', async () => {
        const ownedClient = createClient({ url: ':memory:' });
        const close = vi.spyOn(ownedClient, 'close');
        const owned = new LibSQLSessionStore({ client: ownedClient, ownsClient: true });
        stores.push(owned);
        await owned.initialize();
        const context = new GenericApplicationContext();
        context.setValue('sessionStore', owned);
        context.close();
        context.close();
        owned.dispose();
        expect(close).toHaveBeenCalledTimes(1);
        await expect(ownedClient.execute('SELECT 1')).rejects.toThrow(/closed/i);
        await expect(owned.initialize()).rejects.toThrow(/disposed/i);
        await expect(owned.get('missing')).rejects.toThrow(/disposed/i);
        await expect(owned.create(record(), 1000)).rejects.toThrow(/disposed/i);
        await expect(owned.rotate('missing', record())).rejects.toThrow(/disposed/i);
        await expect(owned.delete('missing')).rejects.toThrow(/disposed/i);

        const { store: borrowed, client } = await openStore();
        const borrowedContext = new GenericApplicationContext();
        borrowedContext.setValue('sessionStore', borrowed);
        borrowedContext.close();
        expect((await client.execute('SELECT 1')).rows[0]?.[0]).toBe(1);
        await expect(borrowed.get('missing')).rejects.toThrow(/disposed/i);
    });

    test('real credentials consumers validate, refresh with remaining TTL, and logout across clients', async () => {
        const { first, second, url } = await fileStores();
        const login = await adapter(first).authenticate({ username: 'alice', password: 'secret' });
        first.close();
        const reopened = new LibSQLSessionStore({ url });
        stores.push(reopened);
        const reader = adapter(reopened);
        expect((await reader.validate(login.token))?.hasRole('user')).toBe(true);
        const direct = createClient({ url });
        clients.push(direct);
        const expiresAt = Date.now() + 2000;
        await direct.execute({
            sql: 'UPDATE blue_sessions SET expires_at = ? WHERE session_id = ?',
            args: [expiresAt, login.token],
        });
        const refreshed = await reader.refresh(login.token);
        expect(refreshed.expiresAt).toBe(expiresAt);
        expect(await adapter(second).validate(login.token)).toBeNull();
        expect((await adapter(second).validate(refreshed.token))?.id).toBe('alice');
        await adapter(second).logout(refreshed.token);
        expect(await reader.validate(refreshed.token)).toBeNull();
        await expect(reader.refresh(refreshed.token)).rejects.toThrow(/invalid credentials/i);
        const expiring = await reader.authenticate({ username: 'alice', password: 'secret' });
        await direct.execute({
            sql: 'UPDATE blue_sessions SET expires_at = ? WHERE session_id = ?',
            args: [Date.now() - 1, expiring.token],
        });
        expect(await reader.validate(expiring.token)).toBeNull();
        await expect(reader.refresh(expiring.token)).rejects.toThrow(/invalid credentials/i);
    });
});
