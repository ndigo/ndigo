/**
 * `QueueMessageStore` contract tests — the in-memory implementation against
 * the documented contract surface (append ordering, replay windows, bounds,
 * retention pruning). Backends are swap-in replaceable: these tests pin the
 * contract, not the implementation.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { InMemoryQueueMessageStore } from '../src/index';

const message = (
    destination: string,
    body = 'm'
): { messageId: string; destination: string; body: string; headers: Record<string, string> } => ({
    messageId: `${destination}-m-1`,
    destination,
    body,
    headers: { 'content-type': 'text/plain' },
});

describe('QueueMessageStore contract (in-memory backend)', () => {
    test('append issues per-destination monotonic sequences and stores byte-exact bodies', async () => {
        const store = new InMemoryQueueMessageStore({
            maxMessagesPerDestination: 100,
            maxDestinations: 100,
            maxBytes: 1024 * 1024,
        });
        const first = await store.append({ ...message('/queue/jobs', 'a'), messageId: 'm1' });
        const second = await store.append({ ...message('/queue/jobs', 'b'), messageId: 'm2' });
        const other = await store.append({ ...message('/queue/other', 'x'), messageId: 'x1' });
        expect(first.seq).toBe(1);
        expect(second.seq).toBe(2);
        expect(other.seq).toBe(1); // independent counter per destination
        expect(first.storedAt).toBeGreaterThan(0);
        expect(second.body).toBe('b');

        // Byte-exact binary bodies survive (D8 parity).
        const bytes = new Uint8Array([0, 255, 0, 9]);
        await store.append({ ...message('/queue/bin'), messageId: 'b1', body: bytes });
        const [replayed] = await store.replay('/queue/bin');
        expect(replayed?.body).toEqual(bytes);
    });

    test('replay returns append order (oldest first), supports afterSeq and limit', async () => {
        const store = new InMemoryQueueMessageStore();
        for (let i = 1; i <= 5; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/x', `m${i}`), messageId: `m${i}` });
        }
        const all = await store.replay('/queue/x');
        expect(all.map((m) => m.body)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
        expect(all.map((m) => m.seq)).toEqual([1, 2, 3, 4, 5]);

        const resumed = await store.replay('/queue/x', { afterSeq: 3 });
        expect(resumed.map((m) => m.body)).toEqual(['m4', 'm5']);

        // `limit` keeps the NEWEST window.
        const window = await store.replay('/queue/x', { limit: 2 });
        expect(window.map((m) => m.body)).toEqual(['m4', 'm5']);
    });

    test('per-destination count bound drops the oldest, holding seq continuity', async () => {
        const store = new InMemoryQueueMessageStore({ maxMessagesPerDestination: 3 });
        for (let i = 1; i <= 5; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/cap', `m${i}`), messageId: `m${i}` });
        }
        const replayed = await store.replay('/queue/cap');
        expect(replayed.map((m) => m.body)).toEqual(['m3', 'm4', 'm5']);
        expect(replayed.map((m) => m.seq)).toEqual([3, 4, 5]); // gaps visible — seq never resets
        // A replay after an evicted seq stays gap-consistent.
        const resumed = await store.replay('/queue/cap', { afterSeq: 4 });
        expect(resumed.map((m) => m.body)).toEqual(['m5']);
        expect(await store.has('/queue/cap')).toBe(true);
    });

    test('a bound of one never drops the in-flight append (COR-9 regression)', async () => {
        const store = new InMemoryQueueMessageStore({ maxMessagesPerDestination: 1 });
        await store.append({ ...message('/queue/one', 'a'), messageId: 'a' });
        await store.append({ ...message('/queue/one', 'b'), messageId: 'b' });
        // Pre-fix: the count guard detached the emptied ring and `b` was
        // written into it — replay returned [] and has() was false.
        expect((await store.replay('/queue/one')).map((m) => m.body)).toEqual(['b']);
        expect(await store.has('/queue/one')).toBe(true);

        await store.append({ ...message('/queue/one', 'c'), messageId: 'c' });
        const replayed = await store.replay('/queue/one');
        expect(replayed.map((m) => m.body)).toEqual(['c']);
        expect(replayed.map((m) => m.seq)).toEqual([3]); // eviction is a watermark, not a reset
    });

    test('seq bookkeeping stays bounded by the destination cap (SEC-1 regression)', async () => {
        const store = new InMemoryQueueMessageStore({ maxDestinations: 5, maxMessagesPerDestination: 10 });
        for (let i = 0; i < 200; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message(`/queue/seed-${i}`, `m${i}`), messageId: `m${i}` });
        }
        // Pre-fix `#seqs` held all 200 client-chosen destinations forever.
        expect(store.stats.destinations).toBe(5);
        expect(store.stats.seqEntries).toBeLessThanOrEqual(5);
        expect(store.stats.retainedBytes).toBeGreaterThan(0);
    });

    test('global byte budget evicts oldest messages across destinations', async () => {
        const store = new InMemoryQueueMessageStore({ maxBytes: 30, maxMessagesPerDestination: 100 });
        await store.append({ ...message('/queue/a', '012345678901') });
        await store.append({ ...message('/queue/a', '012345678901') });
        await store.append({ ...message('/queue/a', '012345678901') });
        // 3 × 12 octets = 36 > 30 → the oldest is evicted.
        const replayed = await store.replay('/queue/a');
        expect(replayed).toHaveLength(2);
        expect(replayed[0]?.seq).toBe(2);
    });

    test('the count bound governs when the byte budget is smaller (PR-10 regression)', async () => {
        // Pre-fix the ring capacity was min(count, bytes) = 100 slots
        // (rounded to 128), so the 129th empty-body append silently
        // overwrote the first: the count bound (1000) never fired, and an
        // empty body cannot trip the byte budget (0 octets). Empty bodies
        // outlive the byte bound, so the ring must reserve the count bound.
        const store = new InMemoryQueueMessageStore({ maxMessagesPerDestination: 1000, maxBytes: 100 });
        for (let i = 1; i <= 200; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/empty', ''), messageId: `e${i}` });
        }
        const replayed = await store.replay('/queue/empty');
        expect(replayed).toHaveLength(200);
        expect(replayed[0]?.messageId).toBe('e1');
        expect(store.stats.retainedBytes).toBe(0); // empty bodies are free — only the count bound applies
    });

    test('destination cap evicts the oldest destination whole', async () => {
        const store = new InMemoryQueueMessageStore({ maxDestinations: 2, maxMessagesPerDestination: 100 });
        await store.append({ ...message('/queue/a'), messageId: 'a1' });
        await store.append({ ...message('/queue/b'), messageId: 'b1' });
        await store.append({ ...message('/queue/c'), messageId: 'c1' }); // evicts /queue/a
        expect(await store.has('/queue/a')).toBe(false);
        expect(await store.has('/queue/b')).toBe(true);
        expect(await store.has('/queue/c')).toBe(true);
        // The evicted destination's bytes and seq counter go with it.
        expect(store.stats).toEqual({ destinations: 2, retainedBytes: 2, seqEntries: 2 });
    });

    test('prune enforces TTL and count retention, and removes empty destinations', async () => {
        let now = 1_000_000;
        const store = new InMemoryQueueMessageStore({
            now: () => now,
        });
        await store.append({ ...message('/queue/ttl', 'old'), messageId: 'old' });
        now += 60_000;
        await store.append({ ...message('/queue/ttl', 'new'), messageId: 'new' });

        // TTL: the oldest message is 60s old; a 30s TTL ages it out.
        expect(await store.prune('/queue/ttl', { ttlMs: 30_000 })).toBe(1);
        const replayed = await store.replay('/queue/ttl');
        expect(replayed.map((m) => m.body)).toEqual(['new']);
        expect(await store.has('/queue/ttl')).toBe(true);

        // Count bound: maxMessages 0 empties the destination and it is
        // dropped from the store.
        expect(await store.prune('/queue/ttl', { maxMessages: 0 })).toBe(1);
        expect(await store.has('/queue/ttl')).toBe(false);
        expect(await store.replay('/queue/ttl')).toEqual([]);
        expect(store.stats).toEqual({ destinations: 0, retainedBytes: 0, seqEntries: 0 });
    });

    test('a message exactly at the TTL boundary is expired (inclusive TTL)', async () => {
        let now = 1_000_000;
        const store = new InMemoryQueueMessageStore({ now: () => now });
        await store.append({ ...message('/queue/boundary', 'x'), messageId: 'x' });
        now += 30_000;
        expect(await store.prune('/queue/boundary', { ttlMs: 30_000 })).toBe(1);
        expect(await store.has('/queue/boundary')).toBe(false);
    });

    test('replay treats an absent or non-finite limit as unbounded', async () => {
        const store = new InMemoryQueueMessageStore();
        for (let i = 1; i <= 3; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/window', `m${i}`), messageId: `m${i}` });
        }
        // Non-finite limits are unbounded, negative clamp to 0 — the exact
        // semantics the libsql backend mirrors.
        const unbounded = await store.replay('/queue/window', { limit: Number.POSITIVE_INFINITY });
        expect(unbounded.map((m) => m.body)).toEqual(['m1', 'm2', 'm3']);
        const nan = await store.replay('/queue/window', { limit: Number.NaN });
        expect(nan.map((m) => m.body)).toEqual(['m1', 'm2', 'm3']);
        expect(await store.replay('/queue/window', { limit: 0 })).toEqual([]);
        expect(await store.replay('/queue/window', { limit: Number.NEGATIVE_INFINITY })).toEqual([]);
    });

    test('dispose forgets all retention and leaves the store usable', async () => {
        const store = new InMemoryQueueMessageStore({ maxMessagesPerDestination: 5 });
        await store.append({ ...message('/queue/a', 'x'), messageId: 'x' });
        store.dispose();
        expect(store.stats).toEqual({ destinations: 0, retainedBytes: 0, seqEntries: 0 });
        expect(await store.has('/queue/a')).toBe(false);
        expect(await store.replay('/queue/a')).toEqual([]);
        store.dispose(); // idempotent
        // A disposed store is not poisoned: the next append restarts clean.
        await store.append({ ...message('/queue/a', 'y'), messageId: 'y' });
        expect((await store.replay('/queue/a')).map((m) => m.body)).toEqual(['y']);
    });

    test('rejects invalid destinations', async () => {
        const store = new InMemoryQueueMessageStore();
        await expect(store.append({ ...message('') })).rejects.toThrow(RangeError);
        await expect(store.replay('')).rejects.toThrow(RangeError);
        await expect(store.prune('', { maxMessages: 1 })).rejects.toThrow(RangeError);
        await expect(store.has('')).rejects.toThrow(RangeError);
        expect(await store.has('/queue/missing')).toBe(false);
    });

    test('defaults honor the documented caps and kinds are observable', async () => {
        const store = new InMemoryQueueMessageStore();
        expect(store.kind).toBe('in-memory');
        // Bound plays: 1001 appends keep the newest 1000.
        for (let i = 1; i <= 1001; i++) {
            // oxlint-disable-next-line no-await-in-loop -- appends must be sequential: the store contract applies them in call order.
            await store.append({ ...message('/queue/defaults', `m${i}`), messageId: `m${i}` });
        }
        const replayed = await store.replay('/queue/defaults');
        expect(replayed).toHaveLength(1000);
        expect(replayed[0]?.body).toBe('m2');
    });

    test('global byte budget evicts the globally oldest message, not the oldest destination head (PRT-REV-010)', async () => {
        let now = 1_000;
        const store = new InMemoryQueueMessageStore({
            maxBytes: 25,
            maxMessagesPerDestination: 2,
            now: () => now,
        });
        const body = '0123456789'; // 10 octets
        const appendAt = async (destination: string, messageId: string, at: number): Promise<void> => {
            now = at;
            await store.append({ ...message(destination, body), messageId });
        };
        await appendAt('/queue/a', 'a1', 1_000);
        await appendAt('/queue/b', 'b1', 2_000);
        // A's head (a2) is now NEWER than B's head (b1): A was created first
        // but its first message was already evicted.
        await appendAt('/queue/a', 'a2', 3_000);
        expect((await store.replay('/queue/a')).map((m) => m.messageId)).toEqual(['a2']);
        // The next append trips the byte budget. The globally oldest message
        // is b1 (t=2s), not A's head a2 (t=3s) — the pre-fix policy evicted
        // the head of the oldest *destination* and wrongly dropped a2.
        await appendAt('/queue/a', 'a3', 4_000);
        expect((await store.replay('/queue/a')).map((m) => m.messageId)).toEqual(['a2', 'a3']);
        expect(await store.has('/queue/b')).toBe(false);
        expect(store.stats).toEqual({ destinations: 1, retainedBytes: 20, seqEntries: 1 });
    });
});
