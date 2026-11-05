/**
 * `LibSQLQueueMessageStore` tests — the durable `/queue` backend against
 * the `QueueMessageStore` contract, on an in-memory libsql connection.
 * The contract surface (ordering, idempotent append, replay windows,
 * prune) must hold identically for the memory and libsql backends.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { afterEach, describe, expect, test } from 'vitest';
import { LibSQLQueueMessageStore } from '../src/index';
import type { StoredQueueMessage } from '@ndigo/socket';

const stores: LibSQLQueueMessageStore[] = [];
afterEach(() => {
    for (const store of stores) store.dispose();
    stores.length = 0;
});

/** A fresh store on a fresh in-memory connection. */
function openStore(): { store: LibSQLQueueMessageStore; client: Client } {
    const client = createClient({ url: ':memory:' });
    const store = new LibSQLQueueMessageStore({ client, ownsClient: true });
    stores.push(store);
    return { store, client };
}

const message = (destination: string, body: string, id = 'm'): Omit<StoredQueueMessage, 'seq' | 'storedAt'> => ({
    messageId: `${id}`,
    destination,
    body,
    headers: { 'content-type': 'text/plain' },
});

describe('LibSQLQueueMessageStore (QueueMessageStore contract)', () => {
    test('append issues monotonic sequences and stores bodies', async () => {
        const { store } = openStore();
        const first = await store.append({ ...message('/queue/jobs', 'a', 'm1') });
        const second = await store.append({ ...message('/queue/jobs', 'b', 'm2') });
        expect(store.kind).toBe('libsql');
        expect(first.seq).toBeLessThan(second.seq);
        expect((await store.replay('/queue/jobs')).map((m) => m.body)).toEqual(['a', 'b']);
    });

    test('a retried append returns the original seq (idempotent, at-least-once)', async () => {
        const { store } = openStore();
        const first = await store.append({ ...message('/queue/jobs', 'x', 'dup') });
        const retried = await store.append({ ...message('/queue/jobs', 'x', 'dup') });
        expect(retried.seq).toBe(first.seq);
        expect(await store.replay('/queue/jobs')).toHaveLength(1);
    });

    test('replay orders by append, supports afterSeq and limit', async () => {
        const { store } = openStore();
        for (let i = 1; i <= 4; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/x', `m${i}`, `m${i}`) });
        }
        expect((await store.replay('/queue/x')).map((m) => m.body)).toEqual(['m1', 'm2', 'm3', 'm4']);
        expect((await store.replay('/queue/x', { afterSeq: 2 })).map((m) => m.body)).toEqual(['m3', 'm4']);
        expect((await store.replay('/queue/x', { limit: 2 })).map((m) => m.body)).toEqual(['m3', 'm4']);
    });

    test('binary bodies round-trip byte-exact; headers round-trip as JSON', async () => {
        const { store } = openStore();
        const bytes = new Uint8Array([0, 255, 0, 7, 9]);
        await store.append({
            messageId: 'bin',
            destination: '/queue/bin',
            body: bytes,
            headers: { 'content-type': 'application/octet-stream', 'x-flag': 'yes' },
        });
        // Non-ASCII text survives the BLOB encode/decode too.
        await store.append({ ...message('/queue/bin', 'café\0nul', 'txt') });
        const replayed = await store.replay('/queue/bin');
        expect(replayed[0]?.body).toEqual(bytes);
        expect(replayed[0]?.headers).toEqual({ 'content-type': 'application/octet-stream', 'x-flag': 'yes' });
        expect(replayed[1]?.body).toBe('café\0nul');
    });

    test('seq is never reused after pruning (autoincrement monotonicity)', async () => {
        const { store } = openStore();
        await store.append({ ...message('/queue/x', 'a', 'a') });
        await store.append({ ...message('/queue/x', 'b', 'b') });
        await store.prune('/queue/x', { maxMessages: 1 }); // drops seq 1
        const next = await store.append({ ...message('/queue/x', 'c', 'c') });
        expect(next.seq).toBeGreaterThan(2); // no reuse of pruned seq
        expect((await store.replay('/queue/x')).map((m) => m.body)).toEqual(['b', 'c']);
    });

    test('prune enforces TTL (stored_at) and count retention; has tracks existence', async () => {
        const { store, client } = openStore();
        await store.append({ ...message('/queue/ttl', 'old', 'old') });
        await store.append({ ...message('/queue/ttl', 'new', 'new') });
        // Age the first row past a 30s TTL (test-side raw SQL; the store
        // owns stored_at in production).
        await client.execute({
            sql: 'UPDATE ndigo_queue_messages SET stored_at = stored_at - 60000 WHERE message_id = ?',
            args: ['old'],
        });
        expect(await store.prune('/queue/ttl', { ttlMs: 30_000 })).toBe(1);
        expect((await store.replay('/queue/ttl')).map((m) => m.body)).toEqual(['new']);
        expect(await store.has('/queue/ttl')).toBe(true);

        expect(await store.prune('/queue/ttl', { maxMessages: 0 })).toBe(1);
        expect(await store.has('/queue/ttl')).toBe(false);
        expect(await store.prune('/queue/ttl', { maxMessages: 0 })).toBe(0); // idempotent
    });

    test('a message exactly at the TTL boundary is expired (inclusive, contract parity)', async () => {
        const { store, client } = openStore();
        await store.append({ ...message('/queue/boundary', 'x', 'x') });
        await client.execute({
            sql: 'UPDATE ndigo_queue_messages SET stored_at = ? WHERE message_id = ?',
            args: [Date.now() - 30_000, 'x'],
        });
        expect(await store.prune('/queue/boundary', { ttlMs: 30_000 })).toBe(1);
        expect(await store.has('/queue/boundary')).toBe(false);
    });

    test('replay treats an absent or non-finite limit as unbounded', async () => {
        const { store } = openStore();
        for (let i = 1; i <= 3; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/window', `m${i}`, `m${i}`) });
        }
        const unbounded = await store.replay('/queue/window', { limit: Number.POSITIVE_INFINITY });
        expect(unbounded.map((m) => m.body)).toEqual(['m1', 'm2', 'm3']);
        const nan = await store.replay('/queue/window', { limit: Number.NaN });
        expect(nan.map((m) => m.body)).toEqual(['m1', 'm2', 'm3']);
        expect(await store.replay('/queue/window', { limit: 0 })).toEqual([]);
        expect(await store.replay('/queue/window', { limit: Number.NEGATIVE_INFINITY })).toEqual([]);
    });

    test('rejects invalid destinations exactly like the in-memory store', async () => {
        const { store } = openStore();
        await expect(store.append({ ...message('', '') })).rejects.toThrow(RangeError);
        await expect(store.replay('')).rejects.toThrow(RangeError);
        await expect(store.prune('', { maxMessages: 1 })).rejects.toThrow(RangeError);
        await expect(store.has('')).rejects.toThrow(RangeError);
    });

    test('disposing a borrowed client leaves other stores and database access usable', async () => {
        const client = createClient({ url: ':memory:' });
        const first = new LibSQLQueueMessageStore({ client });
        const second = new LibSQLQueueMessageStore({ client });
        try {
            await first.append(message('/queue/shared', 'retained', 'shared'));
            first.dispose();
            first.dispose();
            expect((await second.replay('/queue/shared')).map((m) => m.body)).toEqual(['retained']);
            await expect(first.has('/queue/shared')).rejects.toThrow(/disposed/i);
            expect((await client.execute('SELECT COUNT(*) FROM ndigo_queue_messages')).rows[0]?.[0]).toBe(1);
        } finally {
            second.dispose();
            client.close();
        }
    });

    test('dispose closes the client and later operations reject predictably', async () => {
        const { store, client } = openStore();
        await store.append({ ...message('/queue/x', 'a', 'a') });
        store.dispose();
        store.dispose();
        await expect(client.execute('SELECT 1')).rejects.toThrow(/closed/i);
        await expect(store.append(message('/queue/x', 'b', 'b'))).rejects.toThrow(/disposed/i);
        await expect(store.replay('/queue/x')).rejects.toThrow(/disposed/i);
        await expect(store.prune('/queue/x', { maxMessages: 0 })).rejects.toThrow(/disposed/i);
        await expect(store.has('/queue/x')).rejects.toThrow(/disposed/i);
    });

    test('appends survive closing and reopening independent connections to a database file', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'ndigo-queue-'));
        const url = `file:${join(directory, 'queues.db')}`;
        const first = new LibSQLQueueMessageStore({ url });
        let second: LibSQLQueueMessageStore | undefined;
        try {
            const saved = await first.append(message('/queue/persist', 'durable', 'p1'));
            first.dispose();
            second = new LibSQLQueueMessageStore({ url });
            expect(await second.replay('/queue/persist')).toEqual([saved]);
            const next = await second.append(message('/queue/persist', 'next', 'p2'));
            expect(next.seq).toBeGreaterThan(saved.seq);
        } finally {
            first.dispose();
            second?.dispose();
            await rm(directory, { recursive: true, force: true });
        }
    });

    test('schema and operational failures reject instead of returning an empty queue', async () => {
        const client = createClient({ url: ':memory:' });
        await client.execute('CREATE VIEW ndigo_queue_messages AS SELECT 1 AS id');
        const broken = new LibSQLQueueMessageStore({ client, ownsClient: true });
        stores.push(broken);
        await expect(broken.replay('/queue/failure')).rejects.toThrow();
        await expect(broken.append(message('/queue/failure', 'lost'))).rejects.toThrow();

        const { store, client: healthyClient } = openStore();
        await store.append(message('/queue/failure', 'retained'));
        healthyClient.close();
        await expect(store.append(message('/queue/failure', 'lost', 'lost'))).rejects.toThrow(/closed/i);
        await expect(store.replay('/queue/failure')).rejects.toThrow(/closed/i);
        await expect(store.prune('/queue/failure', { maxMessages: 0 })).rejects.toThrow(/closed/i);
        await expect(store.has('/queue/failure')).rejects.toThrow(/closed/i);
    });
});
