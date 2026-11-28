/**
 * CONNECT negotiation, subscriptions, SEND routing, receipts, and shutdown.
 */
import { describe, expect, test, vi } from 'vitest';
import { STOMPBroker } from '../src/index';
import { connect, FakeSession } from './_stomp-broker-harness';

describe('STOMPBroker CONNECT', () => {
    test('answers CONNECTED with negotiated version and session id', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        const [connected] = session.sent;
        expect(connected.command).toBe('CONNECTED');
        expect(connected.headers['version']).toBe('1.2');
        expect(connected.headers['session']).toBeTruthy();
        expect(connected.headers['heart-beat']).toBe('0,0');
    });

    test('negotiates the highest mutual version', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.0', host: 'example.com' });
        await vi.waitFor(() => expect(session.sent[0]?.headers['version']).toBe('1.0'));
    });

    test('a missing accept-version means "1.0 only" (STOMP 1.2 §1.1)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        // No accept-version and no host: a 1.0 client, which needs neither.
        session.push('CONNECT', { 'heart-beat': '0,0' });
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        expect(session.sent[0]?.command).toBe('CONNECTED');
        expect(session.sent[0]?.headers['version']).toBe('1.0');
        expect(session.closedCalls).toHaveLength(0);
    });

    test('CONNECT credentials are rejected while no verifier is configured (SEC-7)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.2', host: 'example.com', login: 'alice', passcode: 'secret' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
        expect(session.sent.at(-1)?.headers['message']).toContain('no credential verifier');
        expect(session.closedCalls[0]?.code).toBe(1008);
        expect(session.sent.some((f) => f.command === 'CONNECTED')).toBe(false);
    });

    test('CONNECT credentials are handed to the verifier (SEC-7)', async () => {
        const verifyCredentials = vi.fn(
            (login: string, passcode: string) => login === 'alice' && passcode === 'secret'
        );
        const broker = new STOMPBroker({ verifyCredentials });
        const accepted = new FakeSession();
        void accepted.handled(broker);
        accepted.push('CONNECT', { 'accept-version': '1.2', host: 'example.com', login: 'alice', passcode: 'secret' });
        await vi.waitFor(() => expect(accepted.sent.some((f) => f.command === 'CONNECTED')).toBe(true));
        expect(verifyCredentials).toHaveBeenCalledWith('alice', 'secret', accepted);

        const rejected = new FakeSession();
        void rejected.handled(broker);
        rejected.push('CONNECT', { 'accept-version': '1.2', host: 'example.com', login: 'alice', passcode: 'wrong' });
        await vi.waitFor(() => expect(rejected.closedCalls.length).toBe(1));
        expect(rejected.sent.at(-1)?.command).toBe('ERROR');
        expect(rejected.sent.at(-1)?.headers['message']).toBe('invalid credentials');
        expect(rejected.closedCalls[0]?.code).toBe(1008);
    });

    test('rejects a frame that is not CONNECT first', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('SEND', { destination: '/topic/x' }, 'hi');
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent[0]?.command).toBe('ERROR');
        expect(session.sent[0]?.headers['message']).toContain('CONNECT must be the first frame');
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('rejects an unsupported accept-version', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '0.9' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'ERROR')).toBe(true));
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('rejects a missing host on STOMP 1.1+', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.2' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent[0]?.command).toBe('ERROR');
    });

    test('ignores heart-beat ping frames', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        session.pushFrame('\n');
        expect(session.closedCalls.length).toBe(0);
        expect(session.sent.length).toBe(1);
    });

    test('rejects a non-text inbound frame', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        session.pushFrame('\0');
        session.closeFromPeer();
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent[1]?.command).toBe('ERROR');
    });
});

describe('STOMPBroker subscriptions', () => {
    test('SUBSCRIBE then publish delivers MESSAGE with the subscriber id', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'sub-1' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        await broker.publish('/topic/chat', 'hello');
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        const message = session.sent[1] as { command: string; headers: Record<string, string>; body: string };
        expect(message.command).toBe('MESSAGE');
        expect(message.headers['destination']).toBe('/topic/chat');
        expect(message.headers['subscription']).toBe('sub-1');
        expect(message.headers['message-id']).toBeTruthy();
        expect(message.body).toBe('hello');
    });

    test('two subscriptions to one destination get distinct MESSAGE frames', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'a' });
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'b' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));
        await broker.publish('/topic/chat', 'x');
        await vi.waitFor(() => expect(session.sent.length).toBe(3));
        const ids = session.sent.slice(1).map((f) => f.headers['subscription']);
        expect(ids).toEqual(['a', 'b']);
    });

    test('two sessions receive the same publish, each with their own id', async () => {
        const broker = new STOMPBroker();
        const a = new FakeSession();
        const b = new FakeSession();
        void a.handled(broker);
        void b.handled(broker);
        connect(broker, a);
        connect(broker, b);
        a.push('SUBSCRIBE', { destination: '/topic/chat', id: 'sess-a' });
        b.push('SUBSCRIBE', { destination: '/topic/chat', id: 'sess-b' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));
        await broker.publish('/topic/chat', 'fan-out');
        await vi.waitFor(() => expect(a.sent.length).toBe(2));
        await vi.waitFor(() => expect(b.sent.length).toBe(2));
        expect(a.sent[1]?.headers['subscription']).toBe('sess-a');
        expect(b.sent[1]?.headers['subscription']).toBe('sess-b');
        expect(a.sent[1]?.body).toBe('fan-out');
        expect(b.sent[1]?.body).toBe('fan-out');
    });

    test('duplicate subscription id fails with ERROR', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'dup' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'dup' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        const error = session.sent.at(-1);
        expect(error?.command).toBe('ERROR');
        expect(error?.headers['message']).toContain('already in use');
    });

    test('UNSUBSCRIBE removes the subscription and stops delivery', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 'sub' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('UNSUBSCRIBE', { id: 'sub' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(0));
        await broker.publish('/topic/chat', 'nobody here');
        // CONNECTED only — SUBSCRIBE/UNSUBSCRIBE emit nothing without a
        // receipt header, and the publish found no subscribers.
        expect(session.sent.length).toBe(1);
    });

    test('UNSUBSCRIBE of an unknown id fails with ERROR', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('UNSUBSCRIBE', { id: 'ghost' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('session-close drops all its subscriptions', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's1' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.closeFromPeer();
        await vi.waitFor(() => expect(broker.subscriptions).toBe(0));
        expect(session.closedCalls.length).toBe(0); // peer-initiated
    });
});

describe('STOMPBroker SEND routing', () => {
    test('SEND fans out to subscribers, including the sender when subscribed', async () => {
        const broker = new STOMPBroker();
        const sender = new FakeSession();
        const other = new FakeSession();
        void sender.handled(broker);
        void other.handled(broker);
        connect(broker, sender);
        connect(broker, other);
        sender.push('SUBSCRIBE', { destination: '/topic/chat', id: 'me' });
        other.push('SUBSCRIBE', { destination: '/topic/chat', id: 'them' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(2));
        sender.push('SEND', { destination: '/topic/chat' }, 'echo me');
        // sender: CONNECTED + its own MESSAGE (echo parity); other: CONNECTED + MESSAGE.
        await vi.waitFor(() => expect(sender.sent.length).toBe(2));
        await vi.waitFor(() => expect(other.sent.length).toBe(2));
        expect(sender.sent.at(-1)?.command).toBe('MESSAGE');
        expect(sender.sent.at(-1)?.body).toBe('echo me');
        expect(other.sent.at(-1)?.command).toBe('MESSAGE');
        expect(other.sent.at(-1)?.body).toBe('echo me');
    });

    test('onMessage returning false suppresses the default fan-out', async () => {
        const onMessage = vi.fn(() => false as unknown);
        const broker = new STOMPBroker({ onMessage });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('SEND', { destination: '/topic/chat', 'x-trace-id': 'trace-1' }, 'intercepted');
        await vi.waitFor(() => expect(onMessage).toHaveBeenCalled());
        // The seam sees the same pass-through header set a MESSAGE frame
        // carries: user-defined headers, never the framing ones —
        // the destination is the first argument, not a header.
        expect(onMessage).toHaveBeenCalledWith('/topic/chat', 'intercepted', { 'x-trace-id': 'trace-1' }, session);
        // CONNECTED only — the fan-out was suppressed, no RECEIPT requested.
        expect(session.sent.length).toBe(1);
    });

    test('SEND without a destination fails with ERROR', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', {});
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('user-defined SEND headers reach the MESSAGE frame (COR-7)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/hdr', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push(
            'SEND',
            { destination: '/topic/hdr', 'x-trace-id': 'trace-7', 'content-type': 'text/plain', receipt: 'r-1' },
            'body'
        );
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
        const message = session.sent.find((f) => f.command === 'MESSAGE');
        expect(message?.headers['x-trace-id']).toBe('trace-7');
        expect(message?.headers['content-type']).toBe('text/plain');
        // Framing headers are the broker's, not the frame's payload.
        expect(message?.headers['receipt']).toBeUndefined();
        expect(message?.headers['transaction']).toBeUndefined();
    });

    test('a transactional SEND produces the same MESSAGE headers as a live one (COR-7)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/parity', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));

        session.push('SEND', { destination: '/topic/parity', 'x-trace-id': 't', 'content-type': 'text/plain' }, 'live');
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(1));
        session.push('BEGIN', { transaction: 'tx-1' });
        session.push(
            'SEND',
            { destination: '/topic/parity', transaction: 'tx-1', 'x-trace-id': 't', 'content-type': 'text/plain' },
            'buffered'
        );
        session.push('COMMIT', { transaction: 'tx-1' });
        await vi.waitFor(() => expect(session.sent.filter((f) => f.command === 'MESSAGE').length).toBe(2));

        const [live, buffered] = session.sent.filter((f) => f.command === 'MESSAGE');
        const { 'message-id': liveId, ...liveHeaders } = live?.headers ?? {};
        const { 'message-id': bufferedId, ...bufferedHeaders } = buffered?.headers ?? {};
        expect(liveId).toBeTruthy();
        expect(bufferedId).toBeTruthy();
        expect(bufferedHeaders).toEqual(liveHeaders);
        expect(buffered?.body).toBe('buffered');
    });

    test('a SEND cannot spoof broker-owned MESSAGE headers (COR-7 guard)', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/spoof', id: 'mine' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push(
            'SEND',
            {
                destination: '/topic/spoof',
                subscription: 'theirs',
                'message-id': 'forged',
                redelivered: 'true',
                ack: 'forged',
            },
            'x'
        );
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'MESSAGE')).toBe(true));
        const message = session.sent.find((f) => f.command === 'MESSAGE');
        expect(message?.headers['subscription']).toBe('mine');
        expect(message?.headers['message-id']).not.toBe('forged');
        expect(message?.headers['redelivered']).toBeUndefined();
        expect(message?.headers['ack']).toBeUndefined(); // auto mode: no ack header
    });
});

describe('STOMPBroker receipts and acks', () => {
    test('frames with a receipt header get a RECEIPT', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/t', id: 's', receipt: 'r-1' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        const receipt = session.sent.find((f) => f.command === 'RECEIPT');
        expect(receipt?.headers['receipt-id']).toBe('r-1');
    });

    test('ERROR carries the receipt-id of the offending frame', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('UNSUBSCRIBE', { id: 'ghost', receipt: 'r-9' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.headers['receipt-id']).toBe('r-9');
    });

    test('ACK/NACK validates the subscription', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/t', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('ACK', { id: 'msg-1', subscription: 's' });
        session.push('NACK', { id: 'msg-2', subscription: 's' });
        expect(session.closedCalls.length).toBe(0);
        session.push('ACK', { id: 'msg-3', subscription: 'ghost' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });
});

describe('STOMPBroker shutdown', () => {
    test('closeAll closes every tracked session', async () => {
        const broker = new STOMPBroker();
        const a = new FakeSession();
        const b = new FakeSession();
        void a.handled(broker);
        void b.handled(broker);
        connect(broker, a);
        connect(broker, b);
        await vi.waitFor(() => expect(a.sent.length).toBe(1));
        await vi.waitFor(() => expect(b.sent.length).toBe(1));
        broker.closeAll();
        expect(a.closedCalls).toEqual([{ code: 1001, reason: 'broker shutdown' }]);
        expect(b.closedCalls).toEqual([{ code: 1001, reason: 'broker shutdown' }]);
        await vi.waitFor(() => expect(broker.subscriptions).toBe(0));
    });

    test('publish to a destination with no subscribers is a no-op', async () => {
        const broker = new STOMPBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1)); // CONNECTED
        await broker.publish('/topic/empty', 'x');
        expect(session.sent.length).toBe(1);
    });
});
