/**
 * `StompBroker` unit tests (AD-23 Phase 1 + the 2026-09-17 remediation
 * wave). Fake `SocketSession`s with AsyncReader-backed message streams.
 * Covers CONNECT negotiation (including the missing-`accept-version` ⇒
 * 1.0 rule and CONNECT credentials), subscribe/publish fan-out with
 * per-subscription ids, SEND routing and header pass-through, receipts,
 * error paths and close codes (store faults, replay budget, identifier
 * caps, policy denials), transactions (caps + COMMIT abort), `/queue`
 * replay ordering, ack modes and id-only ACKs, byte budgets, session-close
 * cleanup, and closeAll.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import {
    AsyncReader,
    InMemoryQueueMessageStore,
    StompBroker,
    StompProtocolError,
    parseStompFrame,
    serializeStompFrame,
    type QueueMessageStore,
    type SocketSession,
    type StoredQueueMessage,
} from '../src/index';

/**
 * Controlled `SocketSession` double: tests push inbound frames and inspect
 * outbound frames / close calls.
 */
class FakeSession implements SocketSession {
    readonly path = '/stomp/chat';
    readonly params: Record<string, unknown> = {};
    readonly query: Record<string, string | string[]> = {};
    readonly headers: Record<string, string | string[] | undefined> = {};
    readonly cookies: Record<string, string> = {};
    readonly attributes: Record<string, unknown> = {};
    readonly #inbound = new AsyncReader<unknown>();
    readonly #outbound: Array<string | Uint8Array> = [];
    readonly #closedEvents = new AsyncReader<number>();
    closedCalls: Array<{ code: number; reason: string }> = [];
    joined: string[] = [];
    left: string[] = [];
    /** When true, `send` throws — simulates a transport mid-close. */
    failSends = false;

    get messages(): AsyncIterable<unknown> {
        return this.#inbound.iterable();
    }

    get closed(): AsyncIterable<number> {
        return this.#closedEvents.iterable();
    }

    get isClosed(): boolean {
        return this.closedCalls.length > 0;
    }

    /** Push a raw inbound frame (string or binary bytes). */
    pushFrame(raw: string | Uint8Array): void {
        this.#inbound.push(raw);
    }

    /** Push a frame with body/headers already split (serializes it). */
    push(command: string, headers: Record<string, string> = {}, body: string | Uint8Array = ''): void {
        this.pushFrame(
            typeof body === 'string'
                ? `${command}\n${Object.entries(headers)
                      .map(([k, v]) => `${k}:${v}`)
                      .join('\n')}\n\n${body}\0`
                : serializeStompFrame({ command, headers, body })
        );
    }

    /** Simulate the peer closing by completing the inbound stream. */
    closeFromPeer(): void {
        this.#inbound.complete();
    }

    send(data: unknown): void {
        if (this.failSends) {
            throw new Error('transport is CLOSING');
        }
        this.#outbound.push(typeof data === 'string' ? data : data instanceof Uint8Array ? data : String(data));
    }

    close(code: number = 1000, reason: string = ''): void {
        this.closedCalls.push({ code, reason });
        if (code !== 0) {
            this.#inbound.complete();
        }
    }

    join(room: string): void {
        this.joined.push(room);
    }

    leave(room: string): void {
        this.left.push(room);
    }

    /** Outbound frames as parsed objects (body text or bytes). */
    get sent(): Array<{ command: string; headers: Record<string, string>; body: string | Uint8Array }> {
        return this.#outbound.map((raw) => parseStompFrame(raw));
    }

    /** Wait for `handleSocket` to finish (stream complete or protocol close). */
    async handled(broker: StompBroker): Promise<void> {
        await broker.handleSocket(this);
    }
}

/** A store whose `append` always fails (backend down). */
class FailingStore implements QueueMessageStore {
    readonly kind = 'failing';
    async append(): Promise<StoredQueueMessage> {
        throw new Error('disk full');
    }
    async replay(): Promise<StoredQueueMessage[]> {
        return [];
    }
    async prune(): Promise<number> {
        return 0;
    }
    async has(): Promise<boolean> {
        return false;
    }
}

/** A store whose `replay` always fails (backend down) but whose appends succeed. */
class ReplayFaultStore implements QueueMessageStore {
    readonly kind = 'replay-fault';
    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        return { ...message, seq: 1, storedAt: 0 };
    }
    async replay(): Promise<StoredQueueMessage[]> {
        throw new Error('backend down');
    }
    async prune(): Promise<number> {
        return 0;
    }
    async has(): Promise<boolean> {
        return true;
    }
}

/** Boot a session through the CONNECT handshake on a broker. */
function connect(broker: StompBroker, session: FakeSession, host = 'example.com'): void {
    session.push('CONNECT', { 'accept-version': '1.2,1.1,1.0', host, 'heart-beat': '0,0' });
}

describe('StompBroker CONNECT', () => {
    test('answers CONNECTED with negotiated version and session id', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.0', host: 'example.com' });
        await vi.waitFor(() => expect(session.sent[0]?.headers['version']).toBe('1.0'));
    });

    test('a missing accept-version means "1.0 only" (STOMP 1.2 §1.1)', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker({ verifyCredentials });
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
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('SEND', { destination: '/topic/x' }, 'hi');
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent[0]?.command).toBe('ERROR');
        expect(session.sent[0]?.headers['message']).toContain('CONNECT must be the first frame');
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('rejects an unsupported accept-version', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '0.9' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'ERROR')).toBe(true));
        expect(session.closedCalls[0]?.code).toBe(1002);
    });

    test('rejects a missing host on STOMP 1.1+', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.2' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent[0]?.command).toBe('ERROR');
    });

    test('ignores heart-beat ping frames', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1));
        session.pushFrame('\n');
        expect(session.closedCalls.length).toBe(0);
        expect(session.sent.length).toBe(1);
    });

    test('rejects a non-text inbound frame', async () => {
        const broker = new StompBroker();
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

describe('StompBroker subscriptions', () => {
    test('SUBSCRIBE then publish delivers MESSAGE with the subscriber id', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('UNSUBSCRIBE', { id: 'ghost' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('session-close drops all its subscriptions', async () => {
        const broker = new StompBroker();
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

describe('StompBroker SEND routing', () => {
    test('SEND fans out to subscribers, including the sender when subscribed', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker({ onMessage });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        session.push('SEND', { destination: '/topic/chat', 'x-trace-id': 'trace-1' }, 'intercepted');
        await vi.waitFor(() => expect(onMessage).toHaveBeenCalled());
        // The seam sees the same pass-through header set a MESSAGE frame
        // carries (COR-7): user-defined headers, never the framing ones —
        // the destination is the first argument, not a header.
        expect(onMessage).toHaveBeenCalledWith('/topic/chat', 'intercepted', { 'x-trace-id': 'trace-1' }, session);
        // CONNECTED only — the fan-out was suppressed, no RECEIPT requested.
        expect(session.sent.length).toBe(1);
    });

    test('SEND without a destination fails with ERROR', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', {});
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.command).toBe('ERROR');
    });

    test('user-defined SEND headers reach the MESSAGE frame (COR-7)', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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

describe('StompBroker receipts and acks', () => {
    test('frames with a receipt header get a RECEIPT', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/t', id: 's', receipt: 'r-1' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        const receipt = session.sent.find((f) => f.command === 'RECEIPT');
        expect(receipt?.headers['receipt-id']).toBe('r-1');
    });

    test('ERROR carries the receipt-id of the offending frame', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('UNSUBSCRIBE', { id: 'ghost', receipt: 'r-9' });
        await vi.waitFor(() => expect(session.closedCalls.length).toBe(1));
        expect(session.sent.at(-1)?.headers['receipt-id']).toBe('r-9');
    });

    test('ACK/NACK validates the subscription', async () => {
        const broker = new StompBroker();
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

describe('StompBroker shutdown', () => {
    test('closeAll closes every tracked session', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        await vi.waitFor(() => expect(session.sent.length).toBe(1)); // CONNECTED
        await broker.publish('/topic/empty', 'x');
        expect(session.sent.length).toBe(1);
    });
});

describe('StompBroker transactions (AD-23 D7)', () => {
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

describe('StompBroker ack tracking + redelivery (AD-23 D9)', () => {
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

describe('StompBroker /user destinations (AD-23 D10)', () => {
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

describe('StompBroker /queue backlog (AD-23 D11)', () => {
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

describe('StompBroker binary bodies (AD-23 D8)', () => {
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

describe('StompBroker ack tracking + redelivery (AD-23 D9)', () => {
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

describe('StompBroker transactions + /user (AD-23 D7/D10)', () => {
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

describe('StompBroker resource caps', () => {
    test('subscription cap fails closed', async () => {
        const broker = new StompBroker({ maxSubscriptionsPerSession: 1 });
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
        const broker = new StompBroker({ maxTransactionsPerSession: 1 });
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
        const broker = new StompBroker({ maxTransactionOps: 1 });
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

describe('StompBroker /queue backlog bounds (D11 hardening)', () => {
    test('whole-destination eviction drops the oldest /queue destination', async () => {
        const broker = new StompBroker({ maxBacklogDestinations: 2, queueBacklog: 10 });
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
        const broker = new StompBroker({ maxBacklogBytes: 30, queueBacklog: 100 });
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

describe('StompBroker queue store seam (durable /queue)', () => {
    test('default wiring: every /queue append is written through the in-memory store', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker({ queueStore: injected });
        await broker.publish('/queue/seam', 'one');
        await broker.publish('/queue/seam', 'two');
        await broker.publish('/queue/seam', 'three');
        expect(broker.queueStore).toBe(injected); // identity — not rebuilt from caps
        const replayed = await injected.replay('/queue/seam');
        expect(replayed.map((m) => m.body)).toEqual(['two', 'three']);
    });

    test('queueBacklog: 0 disables the store (live fan-out only)', async () => {
        const broker = new StompBroker({ queueBacklog: 0 });
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
        const broker = new StompBroker({ queueStore: null });
        expect(broker.queueStore).toBeNull();
        await broker.publish('/queue/x', 'v');
    });

    test('topic publishes never touch the store', async () => {
        const broker = new StompBroker();
        await broker.publish('/topic/seam', 'hello');
        const store = broker.queueStore;
        expect(store).not.toBeNull();
        expect(await store?.replay('/topic/seam')).toEqual([]);
    });
});

describe('StompBroker store-read phase (receipt-after-persist)', () => {
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
        const broker = new StompBroker({ queueStore: new DelayedStore(gate) });
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
        const broker = new StompBroker({ queueStore: new FailingStore() });
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
        const broker = new StompBroker({ queueStore: new FailingStore() });
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SEND', { destination: '/topic/x', receipt: 'r1' }, 'hello');
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'RECEIPT')).toBe(true));
        expect(session.sent.some((f) => f.command === 'ERROR')).toBe(false);
    });

    test('subscribe replay reads the store and receipts only after replay', async () => {
        const broker = new StompBroker({ queueBacklog: 10 });
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
        // Replayed messages are ack-tracked like live deliveries (D9).
        expect(broker.unackedMessages).toBe(0); // auto ack mode — no tracking
    });

    test('a failing replay fails the SUBSCRIBE closed, while history() stays fail-open (COR-8)', async () => {
        const broker = new StompBroker({ queueStore: new ReplayFaultStore() });
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

describe('StompBroker history + retention (message history)', () => {
    test('publish resolves with the stored message for /queue, undefined otherwise', async () => {
        const broker = new StompBroker();
        const stored = await broker.publish('/queue/p', 'x');
        expect(stored?.seq).toBe(1);
        expect(stored?.destination).toBe('/queue/p');
        expect(await broker.publish('/topic/p', 'x')).toBeUndefined();
    });

    test('history queries the retained window with limit and afterSeq', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker({ queueBacklog: 10, retention: { maxMessages: 2 } });
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
        const broker = new StompBroker({ queueStore: store, retention: { ttlMs: 500 } });
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
        const broker = new StompBroker({ queueStore: null });
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

/**
 * A store that retains appends and can hold its next `replay` open — the
 * COR-2 probe needs a replay that is demonstrably in flight while a live
 * publish happens.
 */
class GatedStore implements QueueMessageStore {
    readonly kind = 'gated';
    readonly messages: StoredQueueMessage[] = [];
    replays = 0;
    #gate: Promise<void> | null = null;

    /** Hold the next `replay` until the returned release runs. */
    hold(): () => void {
        let release: () => void = () => undefined;
        this.#gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        return () => {
            this.#gate = null;
            release();
        };
    }

    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        const stored: StoredQueueMessage = { ...message, seq: this.messages.length + 1, storedAt: 0 };
        this.messages.push(stored);
        return stored;
    }

    async replay(): Promise<StoredQueueMessage[]> {
        this.replays += 1;
        const gate = this.#gate;
        if (gate !== null) {
            await gate;
        }
        return Array.from(this.messages);
    }

    async prune(): Promise<number> {
        return 0;
    }

    async has(): Promise<boolean> {
        return this.messages.length > 0;
    }
}

describe('StompBroker /queue replay ordering (COR-2)', () => {
    test('live traffic during a replay is buffered behind the backlog and deduped', async () => {
        const store = new GatedStore();
        const broker = new StompBroker({ queueStore: store });
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

describe('StompBroker ack semantics (COR-1/COR-4)', () => {
    test('client-individual ACK of the newest leaves the earlier obligation outstanding', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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

describe('StompBroker identifier caps (SEC-2)', () => {
    test('an over-long destination fails closed', async () => {
        const broker = new StompBroker({ maxIdentifierLength: 16 });
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
        const broker = new StompBroker({ maxIdentifierLength: 16 });
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

describe('StompBroker authorization seam (SEC-4)', () => {
    test('a denied SUBSCRIBE fails closed before the backlog is replayed', async () => {
        const authorize = vi.fn(
            (destination: string, action: string) => !(action === 'subscribe' && destination === '/queue/secret')
        );
        const broker = new StompBroker({ authorize });
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
        const broker = new StompBroker({ authorize });
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
        const broker = new StompBroker({
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
        const broker = new StompBroker({
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

describe('StompBroker unacked byte budgets (SEC-5)', () => {
    test('the count bound stays exact at a power-of-two bound', async () => {
        // 16 is the ring's own capacity granularity: at that bound a silent
        // overwrite would escape the byte/ack-index accounting, so the
        // gauge must read exactly 16 (not 15) after 17 deliveries.
        const broker = new StompBroker({ maxUnacked: 16, maxUnackedBytes: 130 });
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
        const broker = new StompBroker({ maxUnackedBytes: 10 });
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
        const broker = new StompBroker({ maxUnackedSessionBytes: 10 });
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

describe('StompBroker replay budget (SEC-6)', () => {
    test('exhausting the replay budget fails the SUBSCRIBE closed', async () => {
        const broker = new StompBroker({ maxReplayBytesPerSession: 10 });
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
        const broker = new StompBroker({ queueStore: store, maxReplayBytesPerSession: 6 });
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

describe('StompBroker header budget (PRT-REV-002)', () => {
    test('a frame whose serialized headers exceed maxHeaderBytes fails closed', async () => {
        const broker = new StompBroker({ maxHeaderBytes: 128 });
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
        const broker = new StompBroker({ maxHeaderBytes: 64 });
        await expect(broker.publish('/topic/x', 'm', { 'x-big': 'y'.repeat(100) })).rejects.toBeInstanceOf(
            StompProtocolError
        );
    });
});

describe('StompBroker duplicate message-id ACK indexing (PRT-REV-004)', () => {
    test('an id-only ACK settles every subscription that received the id', async () => {
        const broker = new StompBroker();
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
        const broker = new StompBroker();
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

describe('StompBroker /user unsubscribe binding (PRT-REV-005)', () => {
    test('UNSUBSCRIBE uses the principal bound at subscribe time', async () => {
        const broker = new StompBroker();
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

describe('StompBroker serialization-fault surfacing (PRT-REV-006)', () => {
    test('publish throws on a header value that cannot be framed', async () => {
        const broker = new StompBroker();
        await expect(broker.publish('/topic/x', 'm', { 'x-bad': 'a\u0000b' })).rejects.toBeInstanceOf(
            StompProtocolError
        );
    });

    test('publish throws on an invalid header name or a NUL destination', async () => {
        const broker = new StompBroker();
        await expect(broker.publish('/topic/x', 'm', { 'bad:name': 'v' })).rejects.toBeInstanceOf(StompProtocolError);
        await expect(broker.publish('/topic/x\u0000y', 'm')).rejects.toBeInstanceOf(StompProtocolError);
    });

    test('sendToUser throws before fan-out on an unframeable header', () => {
        const broker = new StompBroker();
        expect(() => broker.sendToUser('alice', '/queue/errors', 'm', { 'x-bad': 'a\u0000b' })).toThrow(
            StompProtocolError
        );
    });
});

describe('StompBroker accept-version cap (PRT-REV-009)', () => {
    test('an over-long accept-version fails closed without splitting it', async () => {
        const broker = new StompBroker({ maxIdentifierLength: 32 });
        const session = new FakeSession();
        const handling = session.handled(broker);
        session.push('CONNECT', { 'accept-version': '1.2,'.repeat(40), host: 'x' });
        await vi.waitFor(() => expect(session.sent.some((f) => f.command === 'ERROR')).toBe(true));
        expect(session.sent.at(-1)?.headers['message']).toContain('accept-version header exceeds 32 characters');
        expect(session.closedCalls.at(-1)?.code).toBe(1002);
        await handling;
    });
});

describe('StompBroker guarded control sends (PRT-REV-011)', () => {
    test('a CONNECTED that cannot be written does not reject handleSocket', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        // The transport races to CLOSING before CONNECTED is written.
        session.failSends = true;
        const handling = session.handled(broker);
        connect(broker, session);
        session.closeFromPeer();
        await expect(handling).resolves.toBeUndefined();
    });

    test('a control RECEIPT that cannot be written does not reject handleSocket', async () => {
        const broker = new StompBroker();
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
