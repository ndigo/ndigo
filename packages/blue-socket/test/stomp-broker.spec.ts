/**
 * `StompBroker` unit tests (AD-23 Phase 1) — fake `SocketSession`s with
 * AsyncReader-backed message streams. Covers CONNECT negotiation,
 * subscribe/publish fan-out with per-subscription ids, SEND routing,
 * receipts, error paths (dup id, unknown unsub, bad version, no host,
 * non-CONNECT first, transactions), session-close cleanup, and closeAll.
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { AsyncReader, StompBroker, parseStompFrame, serializeStompFrame, type SocketSession } from '../src/index';

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
        broker.publish('/topic/chat', 'hello');
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
        broker.publish('/topic/chat', 'x');
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
        broker.publish('/topic/chat', 'fan-out');
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
        broker.publish('/topic/chat', 'nobody here');
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
        session.push('SEND', { destination: '/topic/chat' }, 'intercepted');
        await vi.waitFor(() => expect(onMessage).toHaveBeenCalled());
        expect(onMessage).toHaveBeenCalledWith(
            '/topic/chat',
            'intercepted',
            expect.objectContaining({ destination: '/topic/chat' }),
            session
        );
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
        broker.publish('/topic/empty', 'x');
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
});

describe('StompBroker ack tracking + redelivery (AD-23 D9)', () => {
    test('client-individual ACK removes exactly the named message', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        broker.publish('/topic/chat', 'one');
        broker.publish('/topic/chat', 'two');
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
        broker.publish('/topic/chat', 'a');
        broker.publish('/topic/chat', 'b');
        broker.publish('/topic/chat', 'c');
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
        broker.publish('/topic/chat', 'x');
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
        broker.publish('/topic/chat', 'x');
        await vi.waitFor(() => expect(session.sent.length).toBe(2));
        session.push('NACK', { id: session.sent[1]?.headers['message-id'] as string, subscription: 's' });
        expect(session.sent.length).toBe(2); // no redelivery without tracking
    });

    test('redelivery keeps an empty-queue broker consistent', async () => {
        const broker = new StompBroker();
        const session = new FakeSession();
        void session.handled(broker);
        connect(broker, session);
        session.push('SUBSCRIBE', { destination: '/topic/chat', id: 's', ack: 'client-individual' });
        await vi.waitFor(() => expect(broker.subscriptions).toBe(1));
        broker.publish('/topic/chat', 'ping');
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
        broker.publish('/queue/jobs', 'job-1');
        broker.publish('/queue/jobs', 'job-2');

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
        broker.publish('/queue/jobs', 'j');
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
        broker.publish('/queue/jobs', 'j');
        const late = new FakeSession();
        void late.handled(broker);
        connect(broker, late);
        late.push('SUBSCRIBE', { destination: '/queue/jobs', id: 's' });
        await vi.waitFor(() => expect(late.sent.length).toBe(1)); // CONNECTED only
    });

    test('the backlog is bounded (FIFO eviction)', async () => {
        const broker = new StompBroker({ queueBacklog: 2 });
        broker.publish('/queue/jobs', 'j-1');
        broker.publish('/queue/jobs', 'j-2');
        broker.publish('/queue/jobs', 'j-3');
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
        broker.publish('/topic/bin', body);
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
