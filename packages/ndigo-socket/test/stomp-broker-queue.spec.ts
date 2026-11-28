/**
 * /queue caps, store seams, history/retention, and replay ordering.
 */
import { describe, expect, test, vi } from 'vitest';
import { InMemoryQueueMessageStore, STOMPBroker, type QueueMessageStore, type StoredQueueMessage } from '../src/index';
import { connect, FakeSession, FailingStore, ReplayFaultStore, GatedStore } from './_stomp-broker-harness';

describe('STOMPBroker resource caps', () => {
    test('subscription cap fails closed', async () => {
        const broker = new STOMPBroker({ maxSubscriptionsPerSession: 1 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/a', id: '1' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('SUBSCRIBE', { destination: '/topic/b', id: '2' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('transaction count cap fails closed on BEGIN', async () => {
        const broker = new STOMPBroker({ maxTransactionsPerSession: 1 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 't1', receipt: 'r1' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        session.push('BEGIN', { transaction: 't2' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('transaction buffer caps fail closed on SEND', async () => {
        const broker = new STOMPBroker({ maxTransactionOps: 1 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 't1' });
        session.push('SEND', { destination: '/topic/x', transaction: 't1' }, 'one');
        session.push('SEND', { destination: '/topic/x', transaction: 't1' }, 'two');
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });
});

describe('STOMPBroker /queue backlog bounds (D11 hardening)', () => {
    test('whole-destination eviction drops the oldest /queue destination', async () => {
        const broker = new STOMPBroker({ maxBacklogDestinations: 2, queueBacklog: 10 });
        await broker.publish('/queue/a', 'a1');
        await broker.publish('/queue/b', 'b1');
        await broker.publish('/queue/c', 'c1'); // evicts /queue/a
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/a', id: 's' });
        // The evicted destination replays nothing (only CONNECTED arrives).
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
    });

    test('global byte budget evicts oldest messages across destinations', async () => {
        const broker = new STOMPBroker({ maxBacklogBytes: 30, queueBacklog: 100 });
        // 3 × 12-octet bodies = 36 octets > 30 → the oldest is evicted.
        await broker.publish('/queue/x', '0123456789ab');
        await broker.publish('/queue/x', '0123456789ab');
        await broker.publish('/queue/x', '0123456789ab');
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/x', id: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));
    });
});

describe('STOMPBroker queue store seam (durable /queue)', () => {
    test('default wiring: every /queue append is written through the in-memory store', async () => {
        const broker = new STOMPBroker();
        await broker.publish('/queue/seam', 'hello');
        const store = broker.queueStore;
        expect(store).not.toBeNull();
        expect(store?.kind).toBe('in-memory');
        const replayed = await store?.replay('/queue/seam');
        expect(replayed?.map((m) => m.body)).toEqual(['hello']);
        expect(replayed?.[0]?.destination).toBe('/queue/seam');
        expect(replayed?.[0]?.messageId).toBeTruthy();
        expect(replayed?.[0]?.seq).toBe(1);
    });

    test('an injected store is used as-is, and its own bounds apply', async () => {
        const injected = new InMemoryQueueMessageStore({ maxMessagesPerDestination: 2 });
        const broker = new STOMPBroker({ queueStore: injected });
        await broker.publish('/queue/seam', 'one');
        await broker.publish('/queue/seam', 'two');
        await broker.publish('/queue/seam', 'three');
        expect(broker.queueStore).toBe(injected); // identity — not rebuilt from caps
        const replayed = await injected.replay('/queue/seam');
        expect(replayed.map((m) => m.body)).toEqual(['two', 'three']);
    });

    test('queueBacklog: 0 disables the store (live fan-out only)', async () => {
        const broker = new STOMPBroker({ queueBacklog: 0 });
        expect(broker.queueStore).toBeNull();
        await broker.publish('/queue/x', 'v'); // storage layer absent — no throw
        // Live fan-out still works end to end: a new subscriber replays
        // nothing (no retention), then receives live traffic.
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/x', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/queue/x', 'live');
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
    });

    test('queueStore: null disables the seam even with a backlog configured', async () => {
        const broker = new STOMPBroker({ queueStore: null });
        expect(broker.queueStore).toBeNull();
        await broker.publish('/queue/x', 'v');
    });

    test('topic publishes never touch the store', async () => {
        const broker = new STOMPBroker();
        await broker.publish('/topic/seam', 'hello');
        const store = broker.queueStore;
        expect(store).not.toBeNull();
        expect(await store?.replay('/topic/seam')).toEqual([]);
    });
});

describe('STOMPBroker store-read phase (receipt-after-persist)', () => {
    /** A store whose append resolves only after an explicit release. */
    class DelayedStore implements QueueMessageStore {
        readonly kind = 'delayed';
        constructor(readonly gate: Promise<void>) {}
        async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>) {
            await this.gate;
            return { ...message, seq: 1, storedAt: 0 };
        }
        async replay() {
            return [];
        }
        async prune() {
            return 0;
        }
        async has() {
            return false;
        }
    }

    test('a SEND receipt waits for the /queue append to persist', async () => {
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const broker = new STOMPBroker({ queueStore: new DelayedStore(gate) });
        const subscriber = new FakeSession();
        void subscriber.handled(broker);
        connect(broker, subscriber);
        subscriber.push('SUBSCRIBE', { destination: '/queue/x', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        const sender = new FakeSession();
        void sender.handled(broker);
        connect(broker, sender);
        sender.push('SEND', { destination: '/queue/x', receipt: 'r1' }, 'hello');
        // Delivery (and the receipt) wait for the persisted append: while
        // the gate is shut, nothing is visible.
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
        expect(subscriber.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
        expect(sender.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        release();
        await vi.waitFor(() => expect(subscriber.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
        await vi.waitFor(() => expect(sender.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        expect(sender.sent.findIndex((f) => f.command === 'RECEIPT')).toBeGreaterThan(0);
    });

    test('a store failure withholds the receipt, surfaces an ERROR, and closes 1011 (COR-8)', async () => {
        const broker = new STOMPBroker({ queueStore: new FailingStore() });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', { destination: '/queue/x', receipt: 'r1' }, 'hello');
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.find((f) => f.command === 'ERROR')?.headers['message']).toBe('queue store unavailable');
        // The offending frame asked for a receipt: the ERROR echoes it, and
        // no RECEIPT follows (nothing was persisted).
        expect(session.sent.find((f) => f.command === 'ERROR')?.headers['receipt-id']).toBe('r1');
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        // STOMP 1.2 §1.5: the server MUST close right after the ERROR frame.
        expect(session.closedCalls[0]?.code).toBe(1011);
    });

    test('a failing store never touches /topic sends or their receipts', async () => {
        const broker = new STOMPBroker({ queueStore: new FailingStore() });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', { destination: '/topic/x', receipt: 'r1' }, 'hello');
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        expect(session.sent.some((f) => f.command === 'ERROR')).toBe(false);
    });

    test('subscribe replay reads the store and receipts only after replay', async () => {
        const broker = new STOMPBroker({ queueBacklog: 10 });
        await broker.publish('/queue/r', 'one');
        await broker.publish('/queue/r', 'two');
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/r', id: 's', receipt: 'sub' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));
        expect(session.sent.filter((f) => f.command === 'MESSAGE').map((f) => f.body)).toEqual(['one', 'two']);
        // The SUBSCRIBE receipt follows the replay (ordering guarantee).
        expect(session.sent.findIndex((f) => f.command === 'RECEIPT')).toBeGreaterThan(
            session.sent.findIndex((f) => f.command === 'MESSAGE')
        );
        // Replayed messages are ack-tracked like live deliveries.
        expect(broker.unackedMessages).toBe(0); // auto ack mode — no tracking
    });

    test('a failing replay fails the SUBSCRIBE closed, while history() stays fail-open (COR-8)', async () => {
        const broker = new STOMPBroker({ queueStore: new ReplayFaultStore() });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/fault', id: 's', receipt: 'sub' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        expect(error?.headers['message']).toBe('queue store unavailable');
        expect(error?.headers['receipt-id']).toBe('sub');
        expect(session.closedCalls[0]?.code).toBe(1011);
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        // The read-only history query keeps its documented fail-open.
        expect(await broker.history('/queue/fault')).toEqual([]);
    });
});

describe('STOMPBroker history + retention (message history)', () => {
    test('publish resolves with the stored message for /queue, undefined otherwise', async () => {
        const broker = new STOMPBroker();
        const stored = await broker.publish('/queue/p', 'x');
        expect(stored?.seq).toBe(1);
        expect(stored?.destination).toBe('/queue/p');
        expect(await broker.publish('/topic/p', 'x')).toBeUndefined();
    });

    test('history queries the retained window with limit and afterSeq', async () => {
        const broker = new STOMPBroker();
        await broker.publish('/queue/h', 'm1');
        await broker.publish('/queue/h', 'm2');
        await broker.publish('/queue/h', 'm3');
        expect((await broker.history('/queue/h')).map((m) => m.body)).toEqual(['m1', 'm2', 'm3']);
        expect((await broker.history('/queue/h', { limit: 2 })).map((m) => m.body)).toEqual(['m2', 'm3']);
        expect((await broker.history('/queue/h', { afterSeq: 1 })).map((m) => m.seq)).toEqual([2, 3]);
        expect(await broker.history('/topic/h')).toEqual([]);
        expect(await broker.history('/queue/none')).toEqual([]);
    });

    test('retention.maxMessages bounds both durable retention and subscribe replay', async () => {
        const broker = new STOMPBroker({ queueBacklog: 10, retention: { maxMessages: 2 } });
        await broker.publish('/queue/win', 'one');
        await broker.publish('/queue/win', 'two');
        await broker.publish('/queue/win', 'three');
        expect((await broker.history('/queue/win')).map((m) => m.body)).toEqual(['two', 'three']);
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/win', id: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));
        expect(session.sent.filter((f) => f.command === 'MESSAGE').map((f) => f.body)).toEqual(['two', 'three']);
    });

    test('retention TTL expires messages before replay and history reads', async () => {
        let now = 1_000;
        const store = new InMemoryQueueMessageStore({ now: () => now });
        const broker = new STOMPBroker({ queueStore: store, retention: { ttlMs: 500 } });
        await broker.publish('/queue/ttl', 'fresh');
        now = 1_600;
        await broker.publish('/queue/ttl', 'kept');
        now = 2_000; // 'fresh' is 1000ms old (past the 500 TTL); 'kept' is 400ms old
        expect((await broker.history('/queue/ttl')).map((m) => m.body)).toEqual(['kept']);
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/ttl', id: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(1));
        expect(session.sent.filter((f) => f.command === 'MESSAGE').map((f) => f.body)).toEqual(['kept']);
    });

    test('queueStore: null stops replay (live fan-out only)', async () => {
        const broker = new STOMPBroker({ queueStore: null });
        await broker.publish('/queue/x', 'v');
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/x', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
        await broker.publish('/queue/x', 'live');
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
    });
});
describe('STOMPBroker /queue replay ordering (COR-2)', () => {
    test('live traffic during a replay is buffered behind the backlog and deduped', async () => {
        const store = new GatedStore();
        const broker = new STOMPBroker({ queueStore: store });
        await broker.publish('/queue/ordered', 'old1');

        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        const release = store.hold();
        session.push('SUBSCRIBE', { destination: '/queue/ordered', id: 's', receipt: 'sub' });
        // The replay is now in flight (and parked on the gate).
        await vi.waitFor(() => expect(store.replays).toBe(1));

        // Published while the replay is in flight: it must not overtake the
        // backlog, and the replay window (which will contain it) must not
        // turn into a second delivery.
        await broker.publish('/queue/ordered', 'live1');
        release();
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));

        const messages = session.sent.filter((f) => f.command === 'MESSAGE');
        expect(messages.map((f) => f.body)).toEqual(['old1', 'live1']);
        expect(messages.filter((f) => f.headers['redelivered'] === 'true')).toHaveLength(0);
        // The SUBSCRIBE receipt follows the replay.
        expect(session.sent.findIndex((f) => f.command === 'RECEIPT')).toBeGreaterThan(
            session.sent.findIndex((f) => f.command === 'MESSAGE')
        );
    });
});
