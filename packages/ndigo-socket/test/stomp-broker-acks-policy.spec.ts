/**
 * Ack semantics, identifier/header/replay budgets, authorization, and guarded sends.
 */
import { describe, expect, test, vi } from 'vitest';
import { STOMPBroker, STOMPProtocolError } from '../src/index';
import { connect, FakeSession, GatedStore } from './_stomp-broker-harness';

describe('STOMPBroker ack semantics (COR-1/COR-4)', () => {
    test('client-individual ACK of the newest leaves the earlier obligation outstanding', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/probe', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/probe', 'm-one');
        await broker.publish('/topic/probe', 'm-two');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(2));
        const delivered = session.sent.filter((f) => f.command === 'MESSAGE');

        // ACK the NEWEST: only it settles.
        session.push('ACK', { id: delivered[1]?.headers['message-id'] as string });
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));

        // The oldest is still outstanding — NACK redelivers it, and nothing
        // else (the cumulative-prefix bug dropped it silently).
        session.push('NACK', { id: delivered[0]?.headers['message-id'] as string });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.headers['redelivered'] === 'true').length).toBe(1));
        const redelivered = session.sent.filter((f) => f.headers['redelivered'] === 'true');
        expect(redelivered.map((f) => f.body)).toEqual(['m-one']);
        expect(broker.unackedMessages).toBe(1);
        expect(session.closedCalls).toHaveLength(0);
    });

    test('MESSAGE carries the ack header and ACK works from the id header alone (COR-4)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/interop', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/interop', 'x');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const message = session.sent.find((f) => f.command === 'MESSAGE');
        expect(message?.headers['ack']).toBe(message?.headers['message-id']);

        session.push('ACK', { id: message?.headers['message-id'] as string });
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(0));
        expect(session.closedCalls).toHaveLength(0);

        // NACK from the id alone redelivers the next message.
        await broker.publish('/topic/interop', 'y');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const second = session.sent.filter((f) => f.command === 'MESSAGE').at(-1);
        session.push('NACK', { id: second?.headers['message-id'] as string });
        await vi.waitFor(() => expect(session.sent.some((f) => f.headers['redelivered'] === 'true')).toBe(true));
        expect(session.closedCalls).toHaveLength(0);
    });

    test("an ACK for another session's message fails closed (COR-4)", async () => {
        const broker = new STOMPBroker();
        const subscriber = new FakeSession();
        const other = new FakeSession();
        void subscriber.handled(broker);
        void other.handled(broker);
        connect(broker, subscriber);
        connect(broker, other);
        subscriber.push('SUBSCRIBE', { destination: '/topic/scope', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/scope', 'x');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const messageId = subscriber.sent.find((f) => f.command === 'MESSAGE')?.headers['message-id'] as string;

        other.push('ACK', { id: messageId });
        await vi.waitFor(() => expect(other.closedCalls.length).toBe(1));
        expect(other.sent.at(-1)?.command).toBe('ERROR');
        expect(other.closedCalls[0]?.code).toBe(1002);
        // The owner's obligation is untouched.
        expect(broker.unackedMessages).toBe(1);
    });

    test('an id the subscription no longer tracks is a tolerated no-op (id + subscription)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/gone', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/gone', 'x');
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const messageId = session.sent.find((f) => f.command === 'MESSAGE')?.headers['message-id'] as string;

        session.push('ACK', { id: messageId, subscription: 's' });
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(0));
        // Already settled (or evicted) — no second redelivery, no close.
        session.push('NACK', { id: messageId, subscription: 's' });
        session.push('ACK', { id: 'never-delivered', subscription: 's' });
        // A receipted frame behind them proves both were processed in order
        // (and that the session survived them).
        session.push('SEND', { destination: '/topic/gone', receipt: 'after', 'content-type': 'text/plain' }, 'x');
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        expect(session.sent.filter((f) => f.headers['redelivered'] === 'true')).toHaveLength(0);
        expect(session.closedCalls).toHaveLength(0);
    });
});

describe('STOMPBroker identifier caps (SEC-2)', () => {
    test('an over-long destination fails closed', async () => {
        const broker = new STOMPBroker({ maxIdentifierLength: 16 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: `/topic/${'d'.repeat(32)}`, id: 's' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.headers['message']).toContain('destination header exceeds 16 characters');
        expect(session.closedCalls[0]?.code).toBe(1002);
        expect(broker.subscriptions).toBe(0);
    });

    test('an over-long receipt id fails closed before any effect', async () => {
        const broker = new STOMPBroker({ maxIdentifierLength: 16 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/cap', id: 's', receipt: 'r'.repeat(32) });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.headers['message']).toContain('receipt header exceeds 16 characters');
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        expect(broker.subscriptions).toBe(0);
    });
});

describe('STOMPBroker authorization seam (SEC-4)', () => {
    test('a denied SUBSCRIBE fails closed before the backlog is replayed', async () => {
        const authorize = vi.fn(
            (destination: string, action: string) => !(action === 'subscribe' && destination === '/queue/secret')
        );
        const broker = new STOMPBroker({ authorize });
        await broker.publish('/queue/secret', 'classified');
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/secret', id: 's', receipt: 'sub' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        expect(error?.headers['message']).toContain('subscribe denied');
        expect(error?.headers['receipt-id']).toBe('sub');
        expect(session.closedCalls[0]?.code).toBe(1008);
        // No backlog disclosed, no receipt granted, no binding left behind.
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
        expect(broker.subscriptions).toBe(0);
    });

    test('a denied SEND fails closed identically live and transactional', async () => {
        const authorize = vi.fn(
            async (destination: string, action: string) => !(action === 'send' && destination === '/topic/denied')
        );
        const broker = new STOMPBroker({ authorize });
        const subscriber = new FakeSession();
        void subscriber.handled(broker);
        connect(broker, subscriber);
        subscriber.push('SUBSCRIBE', { destination: '/topic/denied', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        const live = new FakeSession();
        void live.handled(broker);
        connect(broker, live);
        live.push('SEND', { destination: '/topic/denied', receipt: 'r-1' }, 'nope');
        await vi.waitFor(() => expect(live.closedCalls.length).toBe(1));
        expect(live.closedCalls[0]?.code).toBe(1008);
        expect(live.sent.at(-1)?.headers['receipt-id']).toBe('r-1');
        expect(live.sent.some((f) => f.command === 'RECEIPT')).toBe(false);

        const buffered = new FakeSession();
        void buffered.handled(broker);
        connect(broker, buffered);
        buffered.push('BEGIN', { transaction: 'tx-1' });
        buffered.push('SEND', { destination: '/topic/denied', transaction: 'tx-1' }, 'nope');
        buffered.push('COMMIT', { transaction: 'tx-1', receipt: 'commit-1' });
        await vi.waitFor(() => expect(buffered.closedCalls.length).toBe(1));
        expect(buffered.closedCalls[0]?.code).toBe(1008);
        expect(buffered.sent.some((f) => f.command === 'RECEIPT')).toBe(false);

        // Neither form reached the fan-out.
        expect(subscriber.sent.filter((f) => f.command === 'MESSAGE')).toHaveLength(0);
    });

    test('onMessage sees /user SENDs identically live and transactional (SEC-4)', async () => {
        const calls: Array<{ body: unknown; headers: Record<string, string> }> = [];
        const broker = new STOMPBroker({
            onMessage: (_destination, body, headers) => {
                calls.push({ body, headers });
            },
        });
        const session = new FakeSession();
        session.attributes['user'] = 'alice';
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/user/queue/events', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('SEND', { destination: '/user/queue/events', 'x-trace-id': 't' }, 'live');
        await vi.waitFor(() => expect(calls.length).toBe(1));
        session.push('BEGIN', { transaction: 'tx-1' });
        session.push('SEND', { destination: '/user/queue/events', transaction: 'tx-1', 'x-trace-id': 't' }, 'buffered');
        session.push('COMMIT', { transaction: 'tx-1' });
        await vi.waitFor(() => expect(calls.length).toBe(2));

        expect(calls.map((call) => call.body)).toEqual(['live', 'buffered']);
        expect(calls[0]?.headers).toEqual({ 'x-trace-id': 't' });
        expect(calls[1]?.headers).toEqual({ 'x-trace-id': 't' });
        // Both forms reached the sender's own scope.
        const messages = session.sent.filter((f) => f.command === 'MESSAGE');
        expect(messages.map((f) => f.body)).toEqual(['live', 'buffered']);
    });

    test('the authorize seam sees subscribe and send in order, before onMessage', async () => {
        const calls: string[] = [];
        const broker = new STOMPBroker({
            authorize: (destination, action) => {
                calls.push(`authorize:${action}:${destination}`);
                return true;
            },
            onMessage: (destination) => {
                calls.push(`onMessage:${destination}`);
            },
        });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/order', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('SEND', { destination: '/topic/order' }, 'x');
        await vi.waitFor(() => expect(calls).toContain('onMessage:/topic/order'));
        expect(calls).toEqual([
            'authorize:subscribe:/topic/order',
            'authorize:send:/topic/order',
            'onMessage:/topic/order',
        ]);
    });
});

describe('STOMPBroker unacked byte budgets (SEC-5)', () => {
    test('the count bound stays exact at a power-of-two bound', async () => {
        // 16 is the ring's own capacity granularity: at that bound a silent
        // overwrite would escape the byte/ack-index accounting, so the
        // gauge must read exactly 16 (not 15) after 17 deliveries.
        const broker = new STOMPBroker({ maxUnacked: 16, maxUnackedBytes: 130 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/exact', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        for (let delivered = 0; delivered < 17; delivered++) {
            // oxlint-disable-next-line no-await-in-loop -- ordered deliveries: the bound settles over the sequence.
            await broker.publish('/topic/exact', 'aaaaaaaa'); // 8 octets each
        }
        expect(broker.unackedMessages).toBe(16);
    });

    test('maxUnackedBytes evicts the oldest tracked delivery', async () => {
        const broker = new STOMPBroker({ maxUnackedBytes: 10 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/bytes', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/bytes', 'aaaaaa'); // 6 octets
        await broker.publish('/topic/bytes', 'bbbbbb'); // 6 more → oldest evicted
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));
        const delivered = session.sent.filter((f) => f.command === 'MESSAGE');

        // The evicted oldest is gone: its NACK is a tolerated no-op (the
        // subscription is still named, so nothing redelivers).
        session.push('NACK', { id: delivered[0]?.headers['message-id'] as string, subscription: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        expect(session.sent.filter((f) => f.headers['redelivered'] === 'true')).toHaveLength(0);
        // The newest is still tracked and redeliverable.
        session.push('NACK', { id: delivered[1]?.headers['message-id'] as string, subscription: 's' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.headers['redelivered'] === 'true').length).toBe(1));
        expect(session.sent.filter((f) => f.headers['redelivered'] === 'true')[0]?.body).toBe('bbbbbb');
    });

    test('maxUnackedSessionBytes evicts the session-wide oldest delivery', async () => {
        const broker = new STOMPBroker({ maxUnackedSessionBytes: 10 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/a', id: 'a', ack: 'client-individual' });
        session.push('SUBSCRIBE', { destination: '/topic/b', id: 'b', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));
        await broker.publish('/topic/a', 'aaaaaa'); // 6 octets on subscription a
        await broker.publish('/topic/b', 'bbbbbb'); // 12 session-wide → a's oldest goes
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(1));

        session.push('NACK', { id: session.sent.find((f) => f.body === 'aaaaaa')?.headers['message-id'] as string });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        // A bare id for an evicted delivery cannot be attributed — fail closed.
        expect(session.sent.at(-1)?.command).toBe('ERROR');

        // Session teardown releases the remaining tracking state.
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(0));
        expect(broker.subscriptions).toBe(0);
    });
});

describe('STOMPBroker replay budget (SEC-6)', () => {
    test('exhausting the replay budget fails the SUBSCRIBE closed', async () => {
        const broker = new STOMPBroker({ maxReplayBytesPerSession: 10 });
        await broker.publish('/queue/budget', '0123456789ab'); // 12 octets retained
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/queue/budget', id: 's', receipt: 'sub' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        expect(error?.headers['message']).toBe('replay budget exhausted');
        expect(error?.headers['receipt-id']).toBe('sub');
        expect(session.closedCalls[0]?.code).toBe(1013);
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
        expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(false);
    });

    test('live deliveries buffered by a replay consume the same budget', async () => {
        const store = new GatedStore();
        const broker = new STOMPBroker({ queueStore: store, maxReplayBytesPerSession: 6 });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        const release = store.hold();
        session.push('SUBSCRIBE', { destination: '/queue/live-budget', id: 's' });
        await vi.waitFor(() => expect(store.replays).toBe(1));

        await broker.publish('/queue/live-budget', 'aaaaa'); // 5 octets — within budget
        await broker.publish('/queue/live-budget', 'bbbbb'); // 10 > 6 → fail closed
        release();
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.sent.at(-1)?.headers['message']).toBe('replay budget exhausted');
        expect(session.closedCalls[0]?.code).toBe(1013);
        expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(false);
    });
});

describe('STOMPBroker header budget (PRT-REV-002)', () => {
    test('a frame whose serialized headers exceed maxHeaderBytes fails closed', async () => {
        const broker = new STOMPBroker({ maxHeaderBytes: 128 });
        const session = new FakeSession();
        const handling = session.handled(broker);
        connect(broker, session);
        session.push('SEND', { destination: '/topic/x', 'x-big': 'y'.repeat(300) });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'ERROR')).toBe(true));
        expect(session.sent.at(-1)?.headers['message']).toContain('frame headers exceed 128 octets');
        expect(session.closedCalls.at(-1)?.code).toBe(1002);
        await handling;
    });

    test('publish rejects programmatic headers over the cap', async () => {
        const broker = new STOMPBroker({ maxHeaderBytes: 64 });
        await expect(broker.publish('/topic/x', 'm', { 'x-big': 'y'.repeat(100) })).rejects.toBeInstanceOf(
            STOMPProtocolError
        );
    });
});

describe('STOMPBroker duplicate message-id ACK indexing (PRT-REV-004)', () => {
    test('an id-only ACK settles every subscription that received the id', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/dual', id: 's1', ack: 'client-individual', receipt: 'r1' });
        session.push('SUBSCRIBE', { destination: '/topic/dual', id: 's2', ack: 'client-individual', receipt: 'r2' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'RECEIPT').length).toBe(2));
        await broker.publish('/topic/dual', 'm');
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));
        const messages = session.sent.filter((f) => f.command === 'MESSAGE');
        expect(messages[0]?.headers['message-id']).toBe(messages[1]?.headers['message-id']);
        expect(broker.unackedMessages).toBe(2);

        // Pre-fix the id->subscription index was a single slot, so only the
        // last subscription's entry survived and this id-only ACK left the
        // other obligation outstanding forever.
        session.push('ACK', { id: messages[0]?.headers['message-id'] as string });
        await vi.waitFor(() => expect(broker.unackedMessages).toBe(0));
        expect(session.closedCalls).toHaveLength(0);
    });

    test('a dual-subscription id-only NACK redelivers to each owner', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', {
            destination: '/topic/dual-nack',
            id: 's1',
            ack: 'client-individual',
            receipt: 'r1',
        });
        session.push('SUBSCRIBE', {
            destination: '/topic/dual-nack',
            id: 's2',
            ack: 'client-individual',
            receipt: 'r2',
        });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'RECEIPT').length).toBe(2));
        await broker.publish('/topic/dual-nack', 'm');
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));
        const messageId = session.sent.find((f) => f.command === 'MESSAGE')?.headers['message-id'] as string;

        session.push('NACK', { id: messageId });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.headers['redelivered'] === 'true').length).toBe(2));
        expect(broker.unackedMessages).toBe(2);
        expect(session.closedCalls).toHaveLength(0);
    });
});

describe('STOMPBroker /user unsubscribe binding (PRT-REV-005)', () => {
    test('UNSUBSCRIBE uses the principal bound at subscribe time', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        session.attributes['user'] = 'alice';
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/user/queue/errors', id: 'u1', receipt: 'sub' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        broker.sendToUser('alice', '/queue/errors', 'before');
        expect(session.sent.filter((f) => f.command === 'MESSAGE')).toHaveLength(1);

        // The identity changes before the unsubscribe (the adapter owns
        // attributes). Pre-fix the removal re-resolved it to 'bob', left the
        // subscription stranded in alice's scope, and delivered after
        // unsubscribe.
        session.attributes['user'] = 'bob';
        session.push('UNSUBSCRIBE', { id: 'u1', receipt: 'unsub' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'RECEIPT').length).toBe(2));
        broker.sendToUser('alice', '/queue/errors', 'after');
        expect(session.sent.filter((f) => f.command === 'MESSAGE')).toHaveLength(1);
    });
});

describe('STOMPBroker serialization-fault surfacing (PRT-REV-006)', () => {
    test('publish throws on a header value that cannot be framed', async () => {
        const broker = new STOMPBroker();
        await expect(broker.publish('/topic/x', 'm', { 'x-bad': 'a\u0000b' })).rejects.toBeInstanceOf(
            STOMPProtocolError
        );
    });

    test('publish throws on an invalid header name or a NUL destination', async () => {
        const broker = new STOMPBroker();
        await expect(broker.publish('/topic/x', 'm', { 'bad:name': 'v' })).rejects.toBeInstanceOf(STOMPProtocolError);
        await expect(broker.publish('/topic/x\u0000y', 'm')).rejects.toBeInstanceOf(STOMPProtocolError);
    });

    test('sendToUser throws before fan-out on an unframeable header', () => {
        const broker = new STOMPBroker();
        expect(() => broker.sendToUser('alice', '/queue/errors', 'm', { 'x-bad': 'a\u0000b' })).toThrow(
            STOMPProtocolError
        );
    });
});

describe('STOMPBroker accept-version cap (PRT-REV-009)', () => {
    test('an over-long accept-version fails closed without splitting it', async () => {
        const broker = new STOMPBroker({ maxIdentifierLength: 32 });
        const session = new FakeSession();
        const handling = session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.2,'.repeat(40), host: 'x' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'ERROR')).toBe(true));
        expect(session.sent.at(-1)?.headers['message']).toContain('accept-version header exceeds 32 characters');
        expect(session.closedCalls.at(-1)?.code).toBe(1002);
        await handling;
    });
});

describe('STOMPBroker guarded control sends (PRT-REV-011)', () => {
    test('a CONNECTED that cannot be written does not reject handleSocket', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        // The transport races to CLOSING before CONNECTED is written.
        session.failSends = true;
        const handling = session.handled(broker);
        connect(broker, session);
        session.closeFromPeer();
        await expect(handling).resolves.toBeUndefined();
    });

    test('a control RECEIPT that cannot be written does not reject handleSocket', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        const handling = session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'CONNECTED')).toBe(true));
        session.failSends = true;
        session.push('SUBSCRIBE', { destination: '/topic/x', id: 's', receipt: 'r1' });
        session.closeFromPeer();
        // Pre-fix the unguarded RECEIPT write threw out of #receipt and
        // rejected the whole read loop.
        await expect(handling).resolves.toBeUndefined();
    });
});
