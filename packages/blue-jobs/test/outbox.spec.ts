/**
 * @module blue-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { delay } from '@blue/util';
import { InProcessJobDriver } from '../src/in-process-job-driver';
import { JobQueue } from '../src/job-queue';
import { JobOutboxPublisher } from '../src/outbox';
import { InProcessOutboxStore } from '../src/in-process-outbox-store';
import { OutboxRelay } from '../src/outbox-relay';

const T0 = 1_000_000;

/**
 * Deterministic store: controllable clock and sequential ids.
 */
function makeStore(): { store: InProcessOutboxStore; advance: (ms: number) => void } {
    let now = T0;
    let sequence = 0;
    const store = new InProcessOutboxStore({
        clock: () => now,
        idFactory: () => `entry-${++sequence}`,
    });
    return {
        store,
        advance: (ms: number) => {
            now += ms;
        },
    };
}

describe('InProcessOutboxStore', () => {
    let store: InProcessOutboxStore;
    let advance: (ms: number) => void;

    beforeEach(() => {
        ({ store, advance } = makeStore());
    });

    test('append records an unpublished entry', async () => {
        const entry = await store.append({ type: 'email.send', payload: { to: 'a@b.c' } });

        expect(entry.id).toBe('entry-1');
        expect(entry.occurredAt).toBe(T0);
        expect(await store.size()).toBe(1);
    });

    test('claimPending is exclusive while the lease holds', async () => {
        await store.append({ type: 'a' });

        expect(await store.claimPending({ limit: 10, leaseMs: 100 })).toHaveLength(1);
        expect(await store.claimPending({ limit: 10, leaseMs: 100 })).toHaveLength(0);
    });

    test('an expired lease re-surfaces the entry', async () => {
        await store.append({ type: 'a' });
        await store.claimPending({ limit: 10, leaseMs: 100 });

        advance(100);

        expect(await store.claimPending({ limit: 10, leaseMs: 100 })).toHaveLength(1);
    });

    test('markPublished removes the entry from pending; prune deletes it by age', async () => {
        const entry = await store.append({ type: 'a' });
        await store.markPublished(entry.id);
        expect(await store.size()).toBe(0);

        advance(10_000);
        expect(await store.prunePublished(5_000)).toBe(1);
    });

    test('claim order is occurredAt then id', async () => {
        const first = await store.append({ type: 'first' });
        advance(10);
        await store.append({ type: 'second' });
        advance(-10);

        const claimed = await store.claimPending();

        expect(claimed.map((entry) => entry.id)).toEqual([first.id, 'entry-2']);
    });

    test('a closed store rejects operations', async () => {
        await store.close();

        await expect(store.append({ type: 'a' })).rejects.toThrow(/closed/);
        await expect(store.size()).rejects.toThrow(/closed/);
    });
});

describe('JobOutboxPublisher + OutboxRelay', () => {
    test('relay publishes pending entries as jobs and marks them done', async () => {
        const { store } = makeStore();
        const driver = new InProcessJobDriver();
        const queue = new JobQueue({ driver });
        const relay = new OutboxRelay({ store, publisher: new JobOutboxPublisher(queue) });
        await store.append({ type: 'email.send', payload: { to: 'a@b.c' } });

        expect(await relay.tick()).toBe(1);

        expect(await store.size()).toBe(0);
        expect(await driver.size()).toBe(1);
        const [job] = await driver.claim({ limit: 1, leaseMs: 100 });
        expect(job?.type).toBe('email.send');
        expect(job?.payload).toEqual({ to: 'a@b.c' });
        await relay.close();
    });

    test('a failed publish leaves the entry for the next lease window', async () => {
        const { store, advance } = makeStore();
        let failures = 1;
        const published: string[] = [];
        const relay = new OutboxRelay({
            store,
            leaseMs: 100,
            publisher: {
                publish: async (entry) => {
                    if (failures > 0) {
                        failures -= 1;
                        throw new Error('sink down');
                    }
                    published.push(entry.id);
                },
            },
        });
        await store.append({ type: 'a' });

        expect(await relay.tick()).toBe(0);
        expect(await store.size()).toBe(1);
        expect(await store.claimPending({ leaseMs: 100 })).toHaveLength(0); // still leased

        advance(100); // lease expiry re-surfaces the entry
        expect(await relay.tick()).toBe(1);

        expect(published).toEqual(['entry-1']);
        expect(await store.size()).toBe(0);
        await relay.close();
    });

    test('retainPublishedMs prunes published history on each pass', async () => {
        const { store, advance } = makeStore();
        const relay = new OutboxRelay({
            store,
            retainPublishedMs: 500,
            publisher: { publish: async () => undefined },
        });
        await store.append({ type: 'a' });
        expect(await relay.tick()).toBe(1);

        advance(500);
        expect(await relay.tick()).toBe(0);
        expect(await store.prunePublished(500)).toBe(0); // already pruned by the pass
        await relay.close();
    });

    test('relay start/stop polls with real timers; close awaits the pass', async () => {
        const { store } = makeStore();
        const published: string[] = [];
        const relay = new OutboxRelay({
            store,
            pollIntervalMs: 5,
            publisher: {
                publish: async (entry) => {
                    published.push(entry.id);
                },
            },
        });
        relay.start();
        expect(relay.isRunning).toBe(true);
        await store.append({ type: 'a' });
        await delay(30);
        relay.stop();
        expect(relay.isRunning).toBe(false);
        expect(published).toHaveLength(1);
        await relay.close();
        await expect(relay.tick()).rejects.toThrow(/closed/);
    });

    test('constructor validates its collaborators', () => {
        expect(() => new OutboxRelay({ store: {} as never, publisher: { publish: async () => undefined } })).toThrow(
            /not an OutboxStore/
        );
        expect(() => new OutboxRelay({ store: makeStore().store, publisher: {} as never })).toThrow(/publish/);
    });
});
