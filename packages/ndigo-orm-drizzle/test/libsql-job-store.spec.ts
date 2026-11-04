/**
 * `LibSQLJobStore` tests — the durable jobs driver against real libSQL.
 *
 * @module ndigo-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { afterEach, describe, expect, test } from 'vitest';
import { delay } from '@ndigo/util';
import { LibSQLJobStore } from '../src/index';

const stores: LibSQLJobStore[] = [];
const clients: Client[] = [];
const directories: string[] = [];
afterEach(async () => {
    for (const store of stores) {
        // oxlint-disable-next-line no-await-in-loop -- close every store before the clients it may borrow
        await store.close();
    }
    for (const client of clients) client.close();
    for (const directory of directories) {
        // oxlint-disable-next-line no-await-in-loop -- isolated file handles must be released before directory cleanup
        await rm(directory, { recursive: true, force: true });
    }
    stores.length = clients.length = directories.length = 0;
});

function openStore(): LibSQLJobStore {
    const store = new LibSQLJobStore({ url: ':memory:' });
    stores.push(store);
    return store;
}

async function fileStores(): Promise<{ first: LibSQLJobStore; second: LibSQLJobStore; url: string }> {
    const directory = await mkdtemp(join(tmpdir(), 'ndigo-jobs-'));
    directories.push(directory);
    const url = `file:${join(directory, 'jobs.db')}`;
    const first = new LibSQLJobStore({ url });
    const second = new LibSQLJobStore({ url });
    stores.push(first, second);
    return { first, second, url };
}

describe('LibSQLJobStore', () => {
    test('the claim reclaim index exists (state, lease_expires_at)', async () => {
        // AD72-M5: without this index the claim's expired-lease branch scans
        // EVERY running row per pass. The store applies idempotent DDL on
        // open, so a fresh (and an existing) database gains it.
        const client = createClient({ url: ':memory:' });
        clients.push(client);
        const store = new LibSQLJobStore({ client });
        stores.push(store);
        await store.enqueue({ type: 'seed', payload: {} });
        const rows = await client.execute({
            sql: `SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'ndigo_jobs_lease'`,
            args: [],
        });
        expect(Array.isArray(rows.rows) && rows.rows.length).toBe(1);
        expect(rows.rows[0]?.[0]).toBe('ndigo_jobs_lease');
    });
    test('enqueue → claim → complete round-trips a job', async () => {
        const store = openStore();

        const record = await store.enqueue({ type: 'email.send', payload: { to: 'a@b.c' }, maxAttempts: 2 });
        expect(record.attempts).toBe(0);
        expect(await store.size()).toBe(1);

        const claimed = await store.claim({ limit: 5, leaseMs: 1000 });
        expect(claimed).toHaveLength(1);
        expect(claimed[0]?.id).toBe(record.id);
        expect(claimed[0]?.payload).toEqual({ to: 'a@b.c' });
        expect(claimed[0]?.attempts).toBe(1);
        expect(claimed[0]?.maxAttempts).toBe(2);

        await store.complete(record.id);
        expect(await store.size()).toBe(0);
    });

    test('a delayed job is not claimed before its runAt', async () => {
        const store = openStore();
        await store.enqueue({ type: 'later', delayMs: 60 });

        expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
        await delay(80);
        expect(await store.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(1);
    });

    test('an expired lease is reclaimed with attempts incremented', async () => {
        const store = openStore();
        await store.enqueue({ type: 'crashy' });

        const [first] = await store.claim({ limit: 1, leaseMs: 1 });
        expect(first?.attempts).toBe(1);
        await delay(10);

        const [reclaimed] = await store.claim({ limit: 1, leaseMs: 1000 });
        expect(reclaimed?.id).toBe(first?.id);
        expect(reclaimed?.attempts).toBe(2);
    });

    test('heartbeat extends the lease', async () => {
        const store = openStore();
        await store.enqueue({ type: 'slow' });
        const [job] = await store.claim({ limit: 1, leaseMs: 40 });
        if (job === undefined) {
            throw new Error('expected the enqueued job to be claimed');
        }
        await delay(20);
        await store.heartbeat(job.id, 500);

        await delay(30); // past the original lease, inside the extension
        expect(await store.claim({ limit: 1, leaseMs: 1000 })).toHaveLength(0);
    });

    test('two stores on one database never claim the same job', async () => {
        const { first, second } = await fileStores();
        await first.enqueue({ type: 'a' });
        await first.enqueue({ type: 'b' });
        await first.enqueue({ type: 'c' });

        const [left, right] = await Promise.all([
            first.claim({ limit: 2, leaseMs: 1000 }),
            second.claim({ limit: 2, leaseMs: 1000 }),
        ]);

        const ids = [...left, ...right].map((job) => job.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
    });

    test('retry reschedules with the recorded error; fail removes terminally', async () => {
        const store = openStore();
        const retried = await store.enqueue({ type: 'flaky' });
        const failed = await store.enqueue({ type: 'bad', runAt: Date.now() + 60_000 });
        await store.claim({ limit: 2, leaseMs: 1000 });

        await store.retry(retried.id, 0, 'boom');
        const [job] = await store.claim({ limit: 1, leaseMs: 1000 });
        expect(job?.id).toBe(retried.id);
        expect(job?.lastError).toBe('boom');

        await store.fail(failed.id, 'no handler');
        expect(await store.size()).toBe(1); // only the retried job remains
    });

    test('jobs survive a store reopen (durability)', async () => {
        const { first, url } = await fileStores();
        const record = await first.enqueue({ type: 'durable', payload: { n: 1 } });
        await first.close();

        const reopened = new LibSQLJobStore({ url });
        stores.push(reopened);
        expect(await reopened.size()).toBe(1);
        const [job] = await reopened.claim({ limit: 1, leaseMs: 1000 });
        expect(job?.id).toBe(record.id);
        expect(job?.payload).toEqual({ n: 1 });
    });

    test('a borrowed client stays open after dispose; an owned one closes softly', async () => {
        const client = createClient({ url: ':memory:' });
        clients.push(client);
        const borrowed = new LibSQLJobStore({ client });
        stores.push(borrowed);
        await borrowed.close();
        expect(await client.execute('SELECT 1')).toBeDefined();

        await expect(borrowed.size()).rejects.toThrow(/disposed/);
    });

    test('claim validates its window', async () => {
        const store = openStore();

        await expect(store.claim({ limit: 0, leaseMs: 1 })).rejects.toThrow(/limit/);
        await expect(store.claim({ limit: 1, leaseMs: 0 })).rejects.toThrow(/leaseMs/);
    });
});
