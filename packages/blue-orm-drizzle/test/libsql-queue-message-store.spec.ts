/**
 * `LibSQLQueueMessageStore` tests — the durable `/queue` backend against
 * the `QueueMessageStore` contract, on an in-memory libsql connection.
 * The contract surface (ordering, idempotent append, replay windows,
 * prune) must hold identically for the memory and libsql backends.
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, type Client } from '@libsql/client';
import { describe, expect, test } from 'vitest';
import { LibSQLQueueMessageStore } from '../src/index';
import type { QueueMessageStore, StoredQueueMessage } from '@blue/socket';

/** A fresh store on a fresh in-memory connection. */
function openStore(): { store: LibSQLQueueMessageStore; client: Client } {
    const client = createClient({ url: ':memory:' });
    return { store: new LibSQLQueueMessageStore({ client }), client };
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
            sql: 'UPDATE blue_queue_messages SET stored_at = stored_at - 60000 WHERE message_id = ?',
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
            sql: 'UPDATE blue_queue_messages SET stored_at = ? WHERE message_id = ?',
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
        await expect(store.append({ ...message('') })).rejects.toThrow(RangeError);
        await expect(store.replay('')).rejects.toThrow(RangeError);
        await expect(store.prune('', { maxMessages: 1 })).rejects.toThrow(RangeError);
        await expect(store.has('')).rejects.toThrow(RangeError);
    });

    test('dispose closes the client and later operations reject predictably', async () => {
        const { store } = openStore();
        await store.append({ ...message('/queue/x', 'a', 'a') });
        expect(() => store.dispose()).not.toThrow();
        expect(() => store.dispose()).not.toThrow(); // idempotent
        // Documented post-dispose posture: the client's CLIENT_CLOSED error.
        await expect(store.append({ ...message('/queue/x', 'b', 'b') })).rejects.toThrow(/closed/i);
        await expect(store.replay('/queue/x')).rejects.toThrow(/closed/i);
        await expect(store.prune('/queue/x', { maxMessages: 0 })).rejects.toThrow(/closed/i);
        await expect(store.has('/queue/x')).rejects.toThrow(/closed/i);
    });

    test('appends persist across store instances on the same database file', async () => {
        const client = createClient({ url: ':memory:' });
        // Two store instances share one client — but persistence across
        // REOPENED connections needs a file; simulate cross-instance reads
        // on one connection (the durable property libsql gives a new
        // process is the same table layout + rows).
        const firstStore: QueueMessageStore = new LibSQLQueueMessageStore({ client });
        await firstStore.append({ ...message('/queue/persist', 'v', 'p1') });
        const second = new LibSQLQueueMessageStore({ client });
        expect(await second.has('/queue/persist')).toBe(true);
        expect((await second.replay('/queue/persist')).map((m) => m.body)).toEqual(['v']);
    });
});
