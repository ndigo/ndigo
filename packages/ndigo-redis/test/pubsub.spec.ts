/**
 * Real Redis live socket fan-out and consumer lifecycle contracts.
 */
// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WebSocket } from 'ws';
import { NodeSocketSessionRegistry, nodeSocketSession } from '@ndigo/platform-node';
import {
    AsyncReader,
    InMemoryQueueMessageStore,
    StompBroker,
    parseStompFrame,
    serializeStompFrame,
    type SocketSession,
    type StompFrame,
} from '@ndigo/socket';
import { RedisConnection } from '../src';
import { RedisSocketFanout } from '../src/pubsub';
import { decodeSocketFanoutEnvelope } from '../src/pubsub/socket-fanout';

const url = process.env.NDIGO_REDIS_TEST_URL;
// Live integration lane — intentionally skipped unless NDIGO_REDIS_TEST_URL points at a
// running standalone Redis (see the file header); the in-memory unit lane covers the rest.
const live = url === undefined ? describe.skip : describe;

class Session implements SocketSession {
    readonly path = '/stomp';
    readonly params = {};
    readonly query = {};
    readonly headers = {};
    readonly cookies = {};
    readonly attributes: Record<string, unknown> = {};
    readonly inbound = new AsyncReader<unknown>();
    readonly closedEvents = new AsyncReader<number>();
    readonly outbound: Array<string | Uint8Array> = [];
    readonly closes: Array<{ code: number; reason: string }> = [];

    get messages(): AsyncIterable<unknown> {
        return this.inbound.iterable();
    }
    get closed(): AsyncIterable<number> {
        return this.closedEvents.iterable();
    }
    get isClosed(): boolean {
        return this.closes.length > 0;
    }
    send(data: unknown): void {
        if (typeof data !== 'string' && !(data instanceof Uint8Array)) throw new TypeError('Expected a STOMP frame');
        this.outbound.push(data);
    }
    close(code = 1000, reason = ''): void {
        this.closes.push({ code, reason });
        this.closedEvents.push(code);
        this.closedEvents.complete();
        this.inbound.complete();
    }
    join(): void {}
    leave(): void {}
    push(command: string, headers: Record<string, string> = {}, body: string | Uint8Array = ''): void {
        this.inbound.push(serializeStompFrame({ command, headers, body }));
    }
    get sent(): StompFrame[] {
        return this.outbound.map((raw) => parseStompFrame(raw));
    }
    get deliveries(): Array<{
        subscription: string | undefined;
        destination: string | undefined;
        body: unknown;
        contentType: string | undefined;
    }> {
        return this.sent
            .filter((frame) => frame.command === 'MESSAGE')
            .map((frame) => ({
                subscription: frame.headers['subscription'],
                destination: frame.headers['destination'],
                body: material(frame.body),
                contentType: frame.headers['content-type'],
            }));
    }
}

function material(data: unknown): unknown {
    if (data instanceof Uint8Array) return Array.from(data);
    if (data instanceof ArrayBuffer) return Array.from(new Uint8Array(data));
    return data;
}

live('Redis socket fan-out (live standalone Redis)', () => {
    const transports: RedisSocketFanout[] = [];
    const connections: RedisConnection[] = [];
    const registries: NodeSocketSessionRegistry[] = [];
    const brokers: StompBroker[] = [];
    const sessions: Session[] = [];
    const handled: Promise<void>[] = [];

    function transport(namespace: string): { fanout: RedisSocketFanout; connection: RedisConnection } {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        const fanout = new RedisSocketFanout({ connection, subscriberUrl: url, namespace });
        connections.push(connection);
        transports.push(fanout);
        return { fanout, connection };
    }

    function registry(fanout: RedisSocketFanout): NodeSocketSessionRegistry {
        const result = new NodeSocketSessionRegistry({ fanout, heartbeatIntervalMs: null });
        registries.push(result);
        return result;
    }

    function socket(owner: NodeSocketSessionRegistry, path: string) {
        const ws = new EventEmitter();
        const received: unknown[] = [];
        Object.assign(ws, {
            bufferedAmount: 0,
            send: (data: unknown) => received.push(material(data)),
            ping: () => undefined,
            close: (code: number) => ws.emit('close', code, Buffer.alloc(0)),
            terminate: () => ws.emit('close', 1006, Buffer.alloc(0)),
        });
        const session = nodeSocketSession(ws as unknown as WebSocket, path, undefined, owner);
        owner.register(session, path, ws as unknown as WebSocket);
        ws.on('close', (code: number) => owner.remove(session, code));
        return { session, received, ws };
    }

    function broker(fanout: RedisSocketFanout, queueStore = new InMemoryQueueMessageStore()): StompBroker {
        const result = new StompBroker({ fanout, queueStore });
        brokers.push(result);
        return result;
    }

    async function client(owner: StompBroker): Promise<Session> {
        const session = new Session();
        sessions.push(session);
        handled.push(owner.handleSocket(session));
        session.push('CONNECT', { 'accept-version': '1.2', host: 'redis-test', 'heart-beat': '0,0' });
        await vi.waitFor(() => expect(session.sent.map((frame) => frame.command)).toEqual(['CONNECTED']));
        return session;
    }

    async function subscribe(session: Session, id: string, destination: string): Promise<void> {
        const receipt = 'subscribe-' + id;
        session.push('SUBSCRIBE', { id, destination, ack: 'auto', receipt });
        await vi.waitFor(() =>
            expect(
                session.sent.some((frame) => frame.command === 'RECEIPT' && frame.headers['receipt-id'] === receipt)
            ).toBe(true)
        );
    }

    afterEach(async () => {
        await Promise.all(brokers.splice(0).map((item) => item.close()));
        for (const session of sessions.splice(0)) session.inbound.complete();
        await Promise.all(handled.splice(0));
        await Promise.all(registries.splice(0).map((item) => item.close()));
        await Promise.all(transports.splice(0).map((item) => item.close()));
        await Promise.all(connections.splice(0).map((item) => item.close()));
    });

    it('delivers path and room text/binary once on each node, isolating scope, keys, and namespaces', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        const foreign = transport(namespace + '-other');
        const foreignSender = transport(namespace + '-other');
        await Promise.all([a, b, foreign, foreignSender].map((item) => item.fanout.connect()));
        const first = registry(a.fanout);
        const second = registry(b.fanout);
        const isolated = registry(foreign.fanout);
        await Promise.all([first, second, isolated].map((item) => item.connect()));
        const paths = [socket(first, '/chat'), socket(second, '/chat')];
        const rooms = [socket(first, '/other'), socket(second, '/other')];
        first.join(rooms[0].session, '/chat');
        second.join(rooms[1].session, '/chat');
        const excluded = [socket(first, '/unrelated'), socket(second, '/unrelated')];
        first.join(excluded[0].session, 'other-room');
        second.join(excluded[1].session, 'other-room');
        const foreignPath = socket(isolated, '/chat');
        const foreignRoom = socket(isolated, '/other');
        isolated.join(foreignRoom.session, '/chat');

        await first.broadcast('/chat', 'path text');
        await vi.waitFor(() => expect(paths[1].received).toEqual(['path text']));
        await second.broadcast('/chat', new Uint8Array([0, 127, 128, 255]));
        await vi.waitFor(() => expect(paths[0].received).toEqual(['path text', [0, 127, 128, 255]]));
        await first.broadcastTo('/chat', 'room text');
        await vi.waitFor(() => expect(rooms[1].received).toEqual(['room text']));
        await second.broadcastTo('/chat', new Uint8Array([255, 0, 42]));
        await vi.waitFor(() => expect(rooms[0].received).toEqual(['room text', [255, 0, 42]]));
        // A later remote packet on each scope is a processing fence, not a timed absence check.
        await second.broadcast('/chat', 'path fence');
        await first.broadcastTo('/chat', 'room fence');
        await foreignSender.fanout.publish('path', { key: '/chat', body: 'namespace fence' });
        await foreignSender.fanout.publish('room', { key: '/chat', body: 'namespace room fence' });
        await vi.waitFor(() => {
            expect(paths.map((item) => item.received)).toEqual([
                ['path text', [0, 127, 128, 255], 'path fence'],
                ['path text', [0, 127, 128, 255], 'path fence'],
            ]);
            expect(rooms.map((item) => item.received)).toEqual([
                ['room text', [255, 0, 42], 'room fence'],
                ['room text', [255, 0, 42], 'room fence'],
            ]);
            expect(foreignPath.received).toEqual(['namespace fence']);
            expect(foreignRoom.received).toEqual(['namespace room fence']);
        });
        expect(excluded.map((item) => item.received)).toEqual([[], []]);
    });

    it('removes sessions from paths and rooms and stops remote delivery after registry/transport close', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        const first = registry(a.fanout);
        const second = registry(b.fanout);
        await Promise.all([first.connect(), second.connect()]);
        const local = socket(first, '/chat');
        const removed = socket(second, '/chat');
        const peerClosed = socket(second, '/chat');
        const remaining = socket(second, '/chat');
        for (const item of [removed, peerClosed, remaining]) second.join(item.session, 'room');
        await first.broadcast('/chat', 'before');
        await vi.waitFor(() => expect(remaining.received).toEqual(['before']));
        second.remove(removed.session);
        peerClosed.ws.emit('close', 1000, Buffer.alloc(0));
        expect(second.sessions('/chat')).toEqual([remaining.session]);
        await first.broadcast('/chat', 'after remove');
        await first.broadcastTo('room', 'after remove room');
        await vi.waitFor(() => expect(remaining.received).toEqual(['before', 'after remove', 'after remove room']));
        expect(removed.received).toEqual(['before']);
        expect(peerClosed.received).toEqual(['before']);
        await second.close();
        await b.fanout.close();
        await first.broadcast('/chat', 'after close');
        await first.broadcastTo('room', 'after close room');
        expect(local.received).toEqual(['before', 'after remove', 'after close']);
        expect(remaining.received).toEqual(['before', 'after remove', 'after remove room']);
        await expect(second.broadcast('/chat', 'closed')).rejects.toThrow();
        await expect(b.fanout.publish('path', { key: '/chat', body: 'closed' })).rejects.toThrow();
        // Closing the adapter must not close its application-owned publisher.
        expect(await b.connection.run((client) => client.ping())).toBe('PONG');
    });

    it('rejects unready registry startup and closed publisher failures without local delivery', async () => {
        const unopened = transport(randomUUID());
        await expect(unopened.fanout.publish('path', { key: '/chat', body: 'not ready' })).rejects.toThrow();
        await expect(registry(unopened.fanout).connect()).rejects.toThrow();
        const ready = transport(randomUUID());
        await ready.fanout.connect();
        const owner = registry(ready.fanout);
        const recipient = socket(owner, '/chat');
        owner.join(recipient.session, 'room');
        await expect(owner.broadcast('/chat', 'before connect')).rejects.toThrow();
        const starting = owner.connect();
        await expect(owner.broadcastTo('room', 'during connect')).rejects.toThrow();
        await starting;
        await owner.broadcast('/chat', 'ready');
        expect(recipient.received).toEqual(['ready']);
        await ready.connection.close();
        await expect(owner.broadcast('/chat', 'failed path')).rejects.toThrow();
        await expect(owner.broadcastTo('room', 'failed room')).rejects.toThrow();
        expect(recipient.received).toEqual(['ready']);
    });

    it('releases a scope on idempotent unsubscribe and delivers only to the replacement consumer', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        const retired: unknown[] = [];
        const current: unknown[] = [];
        const unsubscribe = await b.fanout.subscribe('path', (message) => retired.push(material(message.body)));
        await expect(b.fanout.subscribe('path', (message) => current.push(message.body))).rejects.toThrow();
        await a.fanout.publish('path', { key: '/chat', body: 'before' });
        await vi.waitFor(() => expect(retired).toEqual(['before']));
        await Promise.all([unsubscribe(), unsubscribe()]);
        await a.fanout.publish('path', { key: '/chat', body: 'while unsubscribed' });
        const unsubscribeReplacement = await b.fanout.subscribe('path', (message) =>
            current.push(material(message.body))
        );
        await a.fanout.publish('path', { key: '/chat', body: new Uint8Array([0, 255]) });
        await a.fanout.publish('path', { key: '/chat', body: 'fence' });
        await vi.waitFor(() => expect(current).toEqual([[0, 255], 'fence']));
        expect(retired).toEqual(['before']);
        await unsubscribeReplacement();
    });

    it('surfaces actual Redis startup authentication failure instead of becoming local-only', async () => {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const publisher = new RedisConnection({ url });
        connections.push(publisher);
        const invalidUrl = new URL(url);
        invalidUrl.username = 'ndigo-nonexistent-' + randomUUID();
        invalidUrl.password = randomUUID();
        const fanout = new RedisSocketFanout({
            connection: publisher,
            subscriberUrl: invalidUrl.toString(),
            namespace: randomUUID(),
        });
        transports.push(fanout);
        await expect(fanout.connect()).rejects.toThrow();
        const owner = registry(fanout);
        const recipient = socket(owner, '/chat');
        await expect(owner.connect()).rejects.toThrow();
        await expect(owner.broadcast('/chat', 'failed startup')).rejects.toThrow();
        expect(recipient.received).toEqual([]);
        const stomp = broker(fanout);
        await expect(stomp.connect()).rejects.toThrow();
        await expect(stomp.publish('/topic/chat', 'failed startup')).rejects.toThrow();
    });

    it('reports a server-killed publisher outage and rejects broadcasts without local delivery', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        const first = registry(a.fanout);
        const second = registry(b.fanout);
        await Promise.all([first.connect(), second.connect()]);
        const local = socket(first, '/chat');
        const remote = socket(second, '/chat');
        first.join(local.session, 'room');
        second.join(remote.session, 'room');
        await first.broadcast('/chat', 'before outage');
        await vi.waitFor(() => expect(remote.received).toEqual(['before outage']));
        const publisherId = await a.connection.run((client) => client.clientId());
        expect(await b.connection.run((client) => client.clientKill({ filter: 'ID', id: publisherId }))).toBe(1);
        await vi.waitFor(() => expect(a.connection.lastError).toBeInstanceOf(Error));
        await expect(first.broadcast('/chat', 'failed path')).rejects.toThrow();
        await expect(first.broadcastTo('room', 'failed room')).rejects.toThrow();
        // Remote broadcast fence: this node stays healthy during the outage.
        await second.broadcastTo('room', 'remote room fence');
        await vi.waitFor(() => expect(local.received).toEqual(['before outage', 'remote room fence']));
        expect(remote.received).toEqual(['before outage', 'remote room fence']);
    });

    it('surfaces the most recent error across connections and malformed inbound envelopes', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        const received: unknown[] = [];
        await a.fanout.subscribe('path', (message) => received.push(message.body));

        // Record an older error on `a` by killing its command connection.
        const publisherId = await a.connection.run((client) => client.clientId());
        expect(await b.connection.run((client) => client.clientKill({ filter: 'ID', id: publisherId }))).toBe(1);
        await vi.waitFor(() => expect(a.connection.lastError).toBeInstanceOf(Error));

        // A later malformed envelope on `a`'s subscriber must win over the
        // older publisher error — decode failures are never permanently masked.
        await b.connection.run((client) => client.publish(`ndigo:socket:${namespace}:path`, 'not-an-envelope'));
        await vi.waitFor(() => expect(a.fanout.lastDecodeError).toBeInstanceOf(Error));
        expect(a.fanout.lastError).toBe(a.fanout.lastDecodeError);
        expect(received).toEqual([]);

        // Decoding failures do not poison the subscription: the next valid
        // remote message still delivers.
        await b.fanout.publish('path', { key: '/chat', body: 'still live' });
        await vi.waitFor(() => expect(received).toEqual(['still live']));
    });

    it('routes real STOMP topic SEND frames once with each node subscription ID and keeps queues local', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        const storeA = new InMemoryQueueMessageStore();
        const storeB = new InMemoryQueueMessageStore();
        const first = broker(a.fanout, storeA);
        const second = broker(b.fanout, storeB);
        await Promise.all([first.connect(), second.connect()]);
        const local = await client(first);
        const remote = await client(second);
        await subscribe(local, 'local-topic', '/topic/chat');
        await subscribe(remote, 'remote-topic', '/topic/chat');
        await subscribe(local, 'local-queue', '/queue/jobs');
        await subscribe(remote, 'remote-queue', '/queue/jobs');
        local.push('SEND', { destination: '/topic/chat', 'content-type': 'text/plain', receipt: 'text' }, 'hello');
        await vi.waitFor(() =>
            expect(
                local.sent.some((frame) => frame.command === 'RECEIPT' && frame.headers['receipt-id'] === 'text')
            ).toBe(true)
        );
        await vi.waitFor(() =>
            expect(remote.deliveries).toEqual([
                { subscription: 'remote-topic', destination: '/topic/chat', body: 'hello', contentType: 'text/plain' },
            ])
        );
        remote.push(
            'SEND',
            { destination: '/topic/chat', 'content-type': 'application/octet-stream', receipt: 'bytes' },
            new Uint8Array([0, 255, 13, 10])
        );
        await vi.waitFor(() =>
            expect(
                remote.sent.some((frame) => frame.command === 'RECEIPT' && frame.headers['receipt-id'] === 'bytes')
            ).toBe(true)
        );
        await vi.waitFor(() =>
            expect(local.deliveries).toEqual([
                { subscription: 'local-topic', destination: '/topic/chat', body: 'hello', contentType: 'text/plain' },
                {
                    subscription: 'local-topic',
                    destination: '/topic/chat',
                    body: [0, 255, 13, 10],
                    contentType: 'application/octet-stream',
                },
            ])
        );
        await first.publish('/queue/jobs', 'first queue');
        await second.publish('/queue/jobs', 'second queue');
        await second.publish('/topic/chat', 'fence', { 'content-type': 'text/plain' });
        await vi.waitFor(() => {
            expect(local.deliveries).toEqual([
                { subscription: 'local-topic', destination: '/topic/chat', body: 'hello', contentType: 'text/plain' },
                {
                    subscription: 'local-topic',
                    destination: '/topic/chat',
                    body: [0, 255, 13, 10],
                    contentType: 'application/octet-stream',
                },
                {
                    subscription: 'local-queue',
                    destination: '/queue/jobs',
                    body: 'first queue',
                    contentType: undefined,
                },
                { subscription: 'local-topic', destination: '/topic/chat', body: 'fence', contentType: 'text/plain' },
            ]);
            expect(remote.deliveries).toEqual([
                { subscription: 'remote-topic', destination: '/topic/chat', body: 'hello', contentType: 'text/plain' },
                {
                    subscription: 'remote-topic',
                    destination: '/topic/chat',
                    body: [0, 255, 13, 10],
                    contentType: 'application/octet-stream',
                },
                {
                    subscription: 'remote-queue',
                    destination: '/queue/jobs',
                    body: 'second queue',
                    contentType: undefined,
                },
                { subscription: 'remote-topic', destination: '/topic/chat', body: 'fence', contentType: 'text/plain' },
            ]);
        });
        expect((await storeA.replay('/queue/jobs')).map((message) => message.body)).toEqual(['first queue']);
        expect((await storeB.replay('/queue/jobs')).map((message) => message.body)).toEqual(['second queue']);
        const lateLocal = await client(first);
        const lateRemote = await client(second);
        await subscribe(lateLocal, 'replay-local', '/queue/jobs');
        await subscribe(lateRemote, 'replay-remote', '/queue/jobs');
        expect(lateLocal.deliveries.map((frame) => frame.body)).toEqual(['first queue']);
        expect(lateRemote.deliveries.map((frame) => frame.body)).toEqual(['second queue']);
    });

    it('rejects broker readiness and failed incoming topic SEND with ERROR and 1011, never a receipt or delivery', async () => {
        const namespace = randomUUID();
        const a = transport(namespace);
        const b = transport(namespace);
        const unready = broker(a.fanout);
        await expect(unready.connect()).rejects.toThrow(/not ready/i);
        await Promise.all([a.fanout.connect(), b.fanout.connect()]);
        await unready.close();
        const first = broker(a.fanout);
        const second = broker(b.fanout);
        await expect(first.publish('/topic/chat', 'before connect')).rejects.toThrow();
        const starting = first.connect();
        await expect(first.publish('/topic/chat', 'during connect')).rejects.toThrow();
        await Promise.all([starting, second.connect()]);
        const sender = await client(first);
        const remote = await client(second);
        await subscribe(sender, 'local', '/topic/chat');
        await subscribe(remote, 'remote', '/topic/chat');
        await a.connection.close();
        await expect(first.publish('/topic/chat', 'failed API publish')).rejects.toThrow();
        sender.push('SEND', { destination: '/topic/chat', receipt: 'failed-send' }, 'failed SEND');
        await vi.waitFor(() => expect(sender.closes.map((item) => item.code)).toEqual([1011]));
        expect(
            sender.sent.filter((frame) => frame.command === 'ERROR').map((frame) => frame.headers['receipt-id'])
        ).toEqual(['failed-send']);
        expect(
            sender.sent.filter((frame) => frame.command === 'RECEIPT').map((frame) => frame.headers['receipt-id'])
        ).not.toContain('failed-send');
        expect(sender.deliveries).toEqual([]);
        // A successful remote publication fences the receiver after the rejected SEND.
        await second.publish('/topic/chat', 'still live');
        expect(remote.deliveries.map((frame) => frame.body)).toEqual(['still live']);
        await second.close();
        await expect(second.publish('/topic/chat', 'after close')).rejects.toThrow();
        expect(remote.closes.map((item) => item.code)).toEqual([1001]);
    });
});

describe('RedisSocketFanout envelope framing (PRT-REV-006)', () => {
    const MAX = 1_048_576;
    const envelope = (headers: unknown, key = '/topic/x'): string =>
        JSON.stringify({
            version: 1,
            origin: '00000000-0000-0000-0000-000000000000',
            key,
            binary: false,
            body: 'm',
            headers,
        });

    it('round-trips a well-formed envelope', () => {
        const decoded = decodeSocketFanoutEnvelope(envelope({ 'content-type': 'text/plain' }), MAX);
        expect(decoded.message.key).toBe('/topic/x');
        expect(decoded.message.headers).toEqual({ 'content-type': 'text/plain' });
    });

    it('rejects header values that cannot be framed (NUL)', () => {
        // A NUL header value would make every subscriber's MESSAGE
        // serialization throw and be swallowed — a silently blackholed
        // destination. It must be rejected at the envelope boundary.
        expect(() => decodeSocketFanoutEnvelope(envelope({ 'x-bad': 'a\u0000b' }), MAX)).toThrow(TypeError);
    });

    it('rejects header names that would split or forge a header line', () => {
        expect(() => decodeSocketFanoutEnvelope(envelope({ 'bad:name': 'v' }), MAX)).toThrow(TypeError);
        expect(() => decodeSocketFanoutEnvelope(envelope({ 'bad\nname': 'v' }), MAX)).toThrow(TypeError);
    });

    it('rejects a NUL in the key (it becomes the destination header)', () => {
        expect(() => decodeSocketFanoutEnvelope(envelope({}, '/topic/x\u0000y'), MAX)).toThrow(TypeError);
    });
});
