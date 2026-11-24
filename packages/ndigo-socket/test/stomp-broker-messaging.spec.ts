/**
 * Transactions, ack tracking, /user scope, /queue backlog, binary bodies, and fan-out.
 */
import { describe, expect, test, vi } from 'vitest';
import { StompBroker } from '../src/index';
import { connect, FakeSession, FailingStore } from './_stomp-broker-harness';

describe('StompBroker transactions', () => {
    test('BEGIN/COMMIT applies buffered SENDs in order', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('SEND', { destination: '/topic/chat', transaction: 'tx-1' }, 'first');
        session.push('SEND', { destination: '/topic/chat', transaction: 'tx-1' }, 'second');
        expect(session.sent.length).toBe(1); // CONNECTED only — nothing applied yet
        session.push('COMMIT', { transaction: 'tx-1' });
        await vi.waitFor(() => expect(session.sent.length).toBe(3)); // CONNECTED + 2 MESSAGEs
        expect(session.sent[1]?.body).toBe('first');
        expect(session.sent[2]?.body).toBe('second');
    });

    test('ABORT discards the buffered operations', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('SEND', { destination: '/topic/chat', transaction: 'tx-1' }, 'never sent');
        session.push('ABORT', { transaction: 'tx-1' });
        expect(session.sent.length).toBe(1); // CONNECTED only
    });

    test('receipts requested inside a transaction are held until COMMIT', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('SEND', { destination: '/t', transaction: 'tx-1', receipt: 'r-1' }, 'x');
        expect(session.sent.some((frame) => frame.command === 'RECEIPT')).toBe(false);
        session.push('COMMIT', { transaction: 'tx-1' });
        await vi.waitFor(() => expect(session.sent.some((frame) => frame.command === 'RECEIPT')).toBe(true));
        const receipts = session.sent.filter((frame) => frame.command === 'RECEIPT');
        expect(receipts[0]?.headers['receipt-id']).toBe('r-1');
    });

    test('frames on an unknown transaction fail closed', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', { destination: '/t', transaction: 'ghost' }, 'x');
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('a duplicate BEGIN fails closed', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('BEGIN', { transaction: 'tx-1' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('COMMIT on an unknown transaction fails closed', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('COMMIT', { transaction: 'ghost' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('buffered ACK/NACK ops obey maxTransactionOps (COR-10)', async () => {
        const broker = new StompBroker({ maxTransactionOps: 3 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/tx-cap', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/tx-cap', 'm');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const messageId = session.sent.at(-1)?.headers['message-id'] as string;

        session.push('BEGIN', { transaction: 'tx-1' });
        for (let op = 0; op < 3; op++) {
            session.push('ACK', { id: messageId, subscription: 's', transaction: 'tx-1' });
        }
        session.push('ACK', { id: messageId, subscription: 's', transaction: 'tx-1' }); // 4th op
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.sent.at(-1)?.headers['message']).toBe('transaction buffer limit reached');
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('buffered ACK ops count their identifier bytes (COR-10)', async () => {
        const broker = new StompBroker({ maxTransactionBytes: 20, nextMessageId: () => 'm'.repeat(40) });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/tx-bytes', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('BEGIN', { transaction: 'tx-1' });
        // 40-octet id + subscription id > the 20-octet budget.
        session.push('ACK', { id: 'm'.repeat(40), subscription: 's', transaction: 'tx-1' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.headers['message']).toBe('transaction buffer limit reached');
    });

    test('a failed op aborts the COMMIT — no receipt, no later ops (COR-11)', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/commit', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('BEGIN', { transaction: 'tx-1' });
        // Op 1 fails closed: no resolved user for a `/user/*` SEND.
        session.push('SEND', { destination: '/user/queue/errors', transaction: 'tx-1', receipt: 'r-1' }, 'first');
        // Op 2 would have been delivered — COMMIT must stop at op 1.
        session.push('SEND', { destination: '/topic/commit', transaction: 'tx-1' }, 'second');
        session.push('COMMIT', { transaction: 'tx-1', receipt: 'commit-1' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.closedCalls[0]?.code).toBe(1008);
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        // The COMMIT's own receipt is echoed by the ERROR and never granted.
        expect(error?.headers['receipt-id']).toBe('commit-1');
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        expect(session.sent.filter((f) => f.command === 'MESSAGE')).toHaveLength(0);
    });

    test('a store fault during COMMIT aborts it closed (COR-8/COR-11)', async () => {
        const broker = new StompBroker({ queueStore: new FailingStore() });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('SEND', { destination: '/queue/fault', transaction: 'tx-1' }, 'x');
        session.push('COMMIT', { transaction: 'tx-1', receipt: 'commit-1' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        expect(error?.headers['message']).toBe('queue store unavailable');
        expect(error?.headers['receipt-id']).toBe('commit-1');
        expect(session.closedCalls[0]?.code).toBe(1011);
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
    });
});

describe('StompBroker ack tracking + redelivery', () => {
    test('client-individual ACK removes exactly the named message', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'one');
        await broker.publish('/topic/chat', 'two');
        await vi.waitFor(() => expect(session.sent.length).toBe(3));
        const firstId = session.sent[1]?.headers['message-id'] as string;

        session.push('ACK', { id: firstId, subscription: 's' });
        // No observable response; then NACK the second → redelivered.
        session.push('NACK', { id: session.sent[2]?.headers['message-id'] as string, subscription: 's' });
        await vi.waitFor(() => expect(session.sent.length).toBe(4));
        const redelivered = session.sent[3] as { command: string; headers: Record<string, string>; body: string };
        expect(redelivered.command).toBe('MESSAGE');
        expect(redelivered.headers['redelivered']).toBe('true');
        expect(redelivered.body).toBe('two');
    });

    test('client-mode ACK acknowledges cumulatively', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'a');
        await broker.publish('/topic/chat', 'b');
        await broker.publish('/topic/chat', 'c');
        await vi.waitFor(() => expect(session.sent.length).toBe(4));
        const middleId = session.sent[2]?.headers['message-id'] as string;
        session.push('ACK', { id: middleId, subscription: 's' });
        // ACK of b covers a+b; NACK of c redelivers c.
        session.push('NACK', { id: session.sent[3]?.headers['message-id'] as string, subscription: 's' });
        await vi.waitFor(() => expect(session.sent.length).toBe(5));
        expect(session.sent[4]?.command).toBe('MESSAGE');
    });

    test('auto ack mode requires no tracking (acks are accepted no-ops)', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'x');
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        session.push('ACK', { id: 'never-delivered', subscription: 's' });
        expect(session.closedCalls.length).toBe(0); // tolerated, not an error
    });

    test('maxUnacked: 0 disables tracking but keeps delivery', async () => {
        const broker = new StompBroker({ maxUnacked: 0 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'x');
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        session.push('NACK', { id: session.sent[1]?.headers['message-id'] as string, subscription: 's' });
        expect(session.sent.length).toBe(2); // no redelivery without tracking
    });

    test('maxUnacked: 0 accepts an id-only ACK/NACK as a receipted no-op (PR-3 regression)', async () => {
        const broker = new StompBroker({ maxUnacked: 0 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/no-track', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/no-track', 'x');
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE')).toHaveLength(1));
        const messageId = session.sent.find((f) => f.command === 'MESSAGE')?.headers['message-id'] as string;

        // The MESSAGE still advertises the `ack` id (the client's
        // spec-mandated anchor); with tracking off the id resolves no
        // entry — a receipted no-op, not ERROR + close(1002).
        session.push('ACK', { id: messageId, receipt: 'r-ack' });
        await vi.waitFor(() =>
            expect(session.sent.some((f) => f.command === 'RECEIPT' && f.headers['receipt-id'] === 'r-ack')).toBe(true)
        );
        expect(session.closedCalls).toHaveLength(0);

        // NACK is the same no-op: nothing tracked, nothing redelivered.
        session.push('NACK', { id: messageId, receipt: 'r-nack' });
        await vi.waitFor(() =>
            expect(session.sent.some((f) => f.command === 'RECEIPT' && f.headers['receipt-id'] === 'r-nack')).toBe(true)
        );
        expect(session.sent.filter((f) => f.headers['redelivered'] === 'true')).toHaveLength(0);
        expect(session.closedCalls).toHaveLength(0);
    });

    test('redelivery keeps an empty-queue broker consistent', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'ping');
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        const messageId = session.sent[1]?.headers['message-id'] as string;
        session.push('ACK', { id: messageId, subscription: 's' });
        // Acking an already-acked (removed) id is a tolerated no-op.
        session.push('ACK', { id: messageId, subscription: 's' });
        expect(session.closedCalls.length).toBe(0);
    });
});

describe('StompBroker /user destinations', () => {
    test('resolveUser default reads session.attributes.user', async () => {
        const broker = new StompBroker();
        const alice = new FakeSession();
        const bob = new FakeSession();
        alice.attributes['user'] = 'alice';
        bob.attributes['user'] = 'bob';
        void alice.handled(broker);
        void bob.handled(broker);
        connect(broker, alice);
        connect(broker, bob);
        alice.push('SUBSCRIBE', { destination: '/user/queue/events', id: 'a1' });
        bob.push('SUBSCRIBE', { destination: '/user/queue/events', id: 'b1' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));

        broker.sendToUser('alice', '/queue/events', 'for-alice');
        await vi.waitFor(() => expect(alice.sent.length).toBe(2));
        const message = alice.sent[1] as { command: string; headers: Record<string, string>; body: string };
        expect(message.command).toBe('MESSAGE');
        expect(message.headers['destination']).toBe('/user/queue/events');
        expect(message.body).toBe('for-alice');
        expect(bob.sent.length).toBe(1); // bob's CONNECTED only
    });

    test('a session without a resolved user cannot bind /user/*', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/user/queue/events', id: 's' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.closedCalls[0]?.code).toBe(1008);
    });

    test('SEND to /user/* reaches only the sender scope', async () => {
        const broker = new StompBroker();
        const alice = new FakeSession();
        const bob = new FakeSession();
        alice.attributes['user'] = 'alice';
        bob.attributes['user'] = 'bob';
        void alice.handled(broker);
        void bob.handled(broker);
        connect(broker, alice);
        connect(broker, bob);
        alice.push('SUBSCRIBE', { destination: '/user/queue/events', id: 'a1' });
        bob.push('SUBSCRIBE', { destination: '/user/queue/events', id: 'b1' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));

        alice.push('SEND', { destination: '/user/queue/events' }, 'from-alice');
        await vi.waitFor(() => expect(alice.sent.length).toBe(2));
        expect(alice.sent[1]?.command).toBe('MESSAGE');
        expect(bob.sent.length).toBe(1); // no cross-user delivery
    });

    test('sendToUser with no scope is a no-op', async () => {
        const broker = new StompBroker();
        broker.sendToUser('nobody', '/queue/events', 'x');
        expect(broker.subscriptions).toBe(0);
    });
});

describe('StompBroker /queue backlog', () => {
    test('a new subscriber replays the backlog before live traffic', async () => {
        const broker = new StompBroker();
        const early = new FakeSession();
        void early.handled(broker);
        connect(broker, early);
        await broker.publish('/queue/jobs', 'job-1');
        await broker.publish('/queue/jobs', 'job-2');

        const late = new FakeSession();
        void late.handled(broker);
        connect(broker, late);
        late.push('SUBSCRIBE', { destination: '/queue/jobs', id: 's' });
        await vi.waitFor(() => expect(late.sent.length).toBe(3)); // CONNECTED + replay x2
        expect(late.sent[1]?.body).toBe('job-1');
        expect(late.sent[2]?.body).toBe('job-2');
    });

    test('backlog messages carry their stored message-id (not redelivered)', async () => {
        const broker = new StompBroker();
        await broker.publish('/queue/jobs', 'j');
        const late = new FakeSession();
        void late.handled(broker);
        connect(broker, late);
        late.push('SUBSCRIBE', { destination: '/queue/jobs', id: 's' });
        await vi.waitFor(() => expect(late.sent.length).toBe(2));
        const replayed = late.sent[1] as { headers: Record<string, string> };
        expect(replayed.headers['redelivered']).toBeUndefined();
        expect(replayed.headers['message-id']).toBeTruthy();
    });

    test('queueBacklog: 0 disables storage (live fan-out only)', async () => {
        const broker = new StompBroker({ queueBacklog: 0 });
        await broker.publish('/queue/jobs', 'j');
        const late = new FakeSession();
        void late.handled(broker);
        connect(broker, late);
        late.push('SUBSCRIBE', { destination: '/queue/jobs', id: 's' });
        await vi.waitFor(() => expect(late.sent.length).toBe(1)); // CONNECTED only
    });

    test('the backlog is bounded (FIFO eviction)', async () => {
        const broker = new StompBroker({ queueBacklog: 2 });
        await broker.publish('/queue/jobs', 'j-1');
        await broker.publish('/queue/jobs', 'j-2');
        await broker.publish('/queue/jobs', 'j-3');
        const late = new FakeSession();
        void late.handled(broker);
        connect(broker, late);
        late.push('SUBSCRIBE', { destination: '/queue/jobs', id: 's' });
        await vi.waitFor(() => expect(late.sent.length).toBe(3)); // CONNECTED + 2 newest
        expect(late.sent[1]?.body).toBe('j-2');
        expect(late.sent[2]?.body).toBe('j-3');
    });
});

describe('StompBroker binary bodies', () => {
    test('publish delivers byte-exact binary bodies', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/bin', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        const body = new Uint8Array([0, 1, 2, 255, 0]);
        await broker.publish('/topic/bin', body);
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        expect(session.sent[1]?.body).toEqual(body);
    });

    test('binary SEND fans out with the byte body intact', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/bin', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        const body = new Uint8Array([7, 0, 8, 0, 9]);
        session.push('SEND', { destination: '/topic/bin' }, body);
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        expect(session.sent[1]?.body).toEqual(body);
    });
});

describe('StompBroker fan-out robustness', () => {
    test('one failing subscriber does not abort the fan-out or the sender', async () => {
        const broker = new StompBroker();
        const good = new FakeSession();
        const failing = new FakeSession();
        void good.handled(broker);
        void failing.handled(broker);
        connect(broker, good);
        connect(broker, failing);
        // Arm the failure only after the CONNECT handshake (the CONNECTED
        // reply must go out before the transport wedges).
        await vi.waitFor(() => expect(failing.sent.length).toBe(1));
        failing.failSends = true;
        good.push('SUBSCRIBE', { destination: '/topic/x', id: 'g', ack: 'client' });
        failing.push('SUBSCRIBE', { destination: '/topic/x', id: 'f', ack: 'client' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));

        await broker.publish('/topic/x', 'hello');
        // The healthy subscriber still got the message; the failing one's
        // mid-close send did not abort the loop.
        await vi.waitFor(() => expect(good.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
        // A failed delivery is not ack-tracked (no delivery, no NACK
        // obligation) — only the healthy subscriber's message is tracked.
        expect(broker.unackedMessages).toBe(1);
        expect(good.isClosed).toBe(false);
    });
});

describe('StompBroker ack tracking + redelivery', () => {
    test('NACK redelivery keeps exactly one outstanding entry', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/x', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/x', 'm1');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const messageId = session.sent.at(-1)?.headers['message-id'];
        expect(messageId).toBeTruthy();

        // NACK: redelivered and re-tracked — still a single outstanding entry.
        session.push('NACK', { id: messageId as string, subscription: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.headers['redelivered'] === 'true').length).toBe(1));
        expect(broker.unackedMessages).toBe(1);

        // NACK again: redelivered again, still a single entry (the
        // duplicate-push bug grew the set by one per NACK forever).
        session.push('NACK', { id: messageId as string, subscription: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.headers['redelivered'] === 'true').length).toBe(2));
        expect(broker.unackedMessages).toBe(1);

        // ACK settles the outstanding entry.
        session.push('ACK', { id: messageId as string, subscription: 's' });
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(0));
    });
});

describe('StompBroker transactions + /user', () => {
    test('transaction-buffered SEND to /user/* reaches the principal scope', async () => {
        const broker = new StompBroker({ resolveUser: (s) => s.attributes['user'] as string | null });
        const sender = new FakeSession();
        sender.attributes['user'] = 'alice';
        const alice = new FakeSession();
        alice.attributes['user'] = 'alice';
        void sender.handled(broker);
        void alice.handled(broker);
        connect(broker, sender);
        connect(broker, alice);
        alice.push('SUBSCRIBE', { destination: '/user/queue/errors', id: 'a' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        sender.push('BEGIN', { transaction: 't1' });
        sender.push('SEND', { destination: '/user/queue/errors', transaction: 't1' }, 'boom');
        sender.push('COMMIT', { transaction: 't1' });
        await vi.waitFor(() => expect(alice.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
        expect(alice.sent.at(-1)?.body).toBe('boom');
    });

    test('transaction-buffered SEND to /user/* without a principal fails closed at COMMIT', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('BEGIN', { transaction: 't1' });
        session.push('SEND', { destination: '/user/queue/errors', transaction: 't1' }, 'boom');
        session.push('COMMIT', { transaction: 't1' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.closedCalls[0]?.code).toBe(1008);
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });
});
