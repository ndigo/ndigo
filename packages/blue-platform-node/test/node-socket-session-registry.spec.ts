/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { EventEmitter } from 'node:events';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DEFAULT_SOCKET_LIMITS, nodeSocketSession, NodeSocketSessionRegistry } from '../src/index';
import type { WebSocket } from 'ws';
import type { SocketSession } from '@blue/dispatcher';

/**
 * Minimal `ws`-shaped transport double: event emitter + send/close/terminate
 * spies. Sessions built on top of it exercise the real contract surface.
 */
function fakeTransport() {
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
    return {
        bufferedAmount: 0,
        on(event: string, fn: (...args: unknown[]) => void) {
            const bucket = listeners.get(event) ?? [];
            bucket.push(fn);
            listeners.set(event, bucket);
            return this;
        },
        emit(event: string, ...args: unknown[]) {
            for (const fn of listeners.get(event) ?? []) {
                fn(...args);
            }
        },
        send: vi.fn(),
        ping: vi.fn(),
        close: vi.fn(),
        terminate: vi.fn(),
    };
}

type Transport = ReturnType<typeof fakeTransport>;

describe('NodeSocketSessionRegistry', () => {
    let registry: NodeSocketSessionRegistry;
    let transports: Transport[];

    const sessionAt = (path: string, transport: Transport = fakeTransport()): SocketSession => {
        const session = nodeSocketSession(transport as unknown as WebSocket, path, undefined, registry);
        registry.register(session, path, transport as unknown as WebSocket);
        transports.push(transport);
        return session;
    };

    beforeEach(() => {
        transports = [];
        registry = new NodeSocketSessionRegistry();
    });

    afterEach(() => {
        registry.stop();
        vi.useRealTimers();
    });

    test('tracks sessions per path and prunes on remove (idempotent)', () => {
        const a = sessionAt('/echo');
        const b = sessionAt('/room');

        expect(registry.count('/echo')).toBe(1);
        expect(registry.sessions('/echo')).toEqual([a]);
        expect(registry.count('/room')).toBe(1);
        expect(registry.count('/nope')).toBe(0);

        registry.remove(a);
        registry.remove(a); // idempotent
        expect(registry.count('/echo')).toBe(0);
        expect(registry.count('/room')).toBe(1);
        expect(registry.sessions('/room')).toEqual([b]);
    });

    test('broadcast fans out to the path set: strings as text, others JSON, closed skipped', () => {
        sessionAt('/echo');
        sessionAt('/echo');
        sessionAt('/elsewhere');

        registry.broadcast('/echo', 'hello');
        expect(transports[0].send).toHaveBeenCalledWith('hello');
        expect(transports[1].send).toHaveBeenCalledWith('hello');
        expect(transports[2].send).not.toHaveBeenCalled();

        registry.broadcast('/echo', { event: 'tick' });
        expect(transports[0].send).toHaveBeenLastCalledWith(JSON.stringify({ event: 'tick' }));

        // Peer closes a: subsequent broadcasts skip the closed session.
        transports[0].emit('close', 1000, 'done');
        registry.broadcast('/echo', 'again');
        expect(transports[0].send).toHaveBeenLastCalledWith(JSON.stringify({ event: 'tick' }));
        expect(transports[1].send).toHaveBeenLastCalledWith('again');
    });

    test('a throwing session transport does not break the broadcast', () => {
        sessionAt('/echo');
        sessionAt('/echo');
        transports[1].send.mockImplementation(() => {
            throw new Error('socket not open');
        });

        expect(() => registry.broadcast('/echo', 'x')).not.toThrow();
        expect(transports[0].send).toHaveBeenCalledWith('x');
    });

    test('rooms: join/leave/broadcastTo, empty rooms pruned, invalid names rejected', () => {
        const a = sessionAt('/echo');
        const b = sessionAt('/echo');

        registry.join(a, 'chat');
        registry.join(b, 'chat');
        registry.broadcastTo('chat', 'hi');
        expect(transports[0].send).toHaveBeenCalledWith('hi');
        expect(transports[1].send).toHaveBeenCalledWith('hi');

        registry.leave(a, 'chat');
        registry.broadcastTo('chat', 'single');
        expect(transports[0].send).toHaveBeenLastCalledWith('hi');
        expect(transports[1].send).toHaveBeenLastCalledWith('single');

        registry.leave(b, 'chat');
        registry.broadcastTo('chat', 'nobody'); // pruned room → no-op
        expect(transports[0].send).toHaveBeenLastCalledWith('hi');
        expect(transports[1].send).toHaveBeenLastCalledWith('single');

        // Session-side join/leave route through the registry.
        expect(() => a.join('')).toThrow(RangeError);
        expect(() => a.join(42 as unknown as string)).toThrow(RangeError);
        expect(() => registry.join(a, '')).toThrow(RangeError);
    });

    test('backpressure default closes the overloaded session at the 1 MiB watermark', () => {
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null });
        sessionAt('/echo');
        sessionAt('/echo');
        transports[0].bufferedAmount = 2_000_000; // > default 1 MiB

        registry.broadcast('/echo', 'x');
        expect(transports[0].close).toHaveBeenCalledWith(1013, 'consumer too slow');
        expect(transports[0].send).not.toHaveBeenCalled();
        expect(transports[1].send).toHaveBeenCalledWith('x');
    });

    test('backpressure drop policy skips the overloaded session silently', () => {
        registry = new NodeSocketSessionRegistry({
            heartbeatIntervalMs: null,
            backpressure: { maxBufferedBytes: 1024, onOverflow: 'drop' },
        });
        sessionAt('/echo');
        sessionAt('/echo');
        transports[0].bufferedAmount = 4096;

        registry.broadcast('/echo', 'y');
        expect(transports[0].send).not.toHaveBeenCalled();
        expect(transports[0].close).not.toHaveBeenCalled();
        expect(transports[1].send).toHaveBeenCalledWith('y');
    });

    test('backpressure null disables the watermark guard', () => {
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null, backpressure: null });
        // Disable the session-level guard too so this test isolates the
        // registry's policy seam (the session guard now enforces the same
        // watermark at the send chokepoint by default).
        const transport = fakeTransport();
        const session = nodeSocketSession(transport as unknown as WebSocket, '/echo', undefined, registry, {
            ...DEFAULT_SOCKET_LIMITS,
            maxBufferedBytes: null,
        });
        registry.register(session, '/echo', transport as unknown as WebSocket);
        transports.push(transport);
        transport.bufferedAmount = 100_000_000;

        registry.broadcast('/echo', 'z');
        expect(transports[0].send).toHaveBeenCalledWith('z');
    });

    test('onOverflow observer reports close decisions with path and bytes', () => {
        const onOverflow = vi.fn();
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null, onOverflow });
        sessionAt('/echo');
        transports[0].bufferedAmount = 2_000_000;

        registry.broadcast('/echo', 'x');
        expect(onOverflow).toHaveBeenCalledWith({ path: '/echo', action: 'close', bufferedBytes: 2_000_000 });
        expect(transports[0].close).toHaveBeenCalledWith(1013, 'consumer too slow');
    });

    test('onOverflow observer reports drop decisions', () => {
        const onOverflow = vi.fn();
        registry = new NodeSocketSessionRegistry({
            heartbeatIntervalMs: null,
            backpressure: { maxBufferedBytes: 1024, onOverflow: 'drop' },
            onOverflow,
        });
        sessionAt('/echo');
        transports[0].bufferedAmount = 4096;

        registry.broadcast('/echo', 'y');
        expect(onOverflow).toHaveBeenCalledWith({ path: '/echo', action: 'drop', bufferedBytes: 4096 });
        expect(transports[0].close).not.toHaveBeenCalled();
    });

    test('closeAll closes every open session', () => {
        sessionAt('/echo');
        sessionAt('/room');

        registry.closeAll(1001, 'bye');
        expect(transports[0].close).toHaveBeenCalledWith(1001, 'bye');
        expect(transports[1].close).toHaveBeenCalledWith(1001, 'bye');
    });

    test('session attributes are a per-connection bag', () => {
        const session = sessionAt('/echo');
        expect(session.attributes).toEqual({});
        session.attributes['user'] = 'alice';
        expect(registry.sessions('/echo')[0]?.attributes).toEqual({ user: 'alice' });
    });

    test('session attaches an error listener so transport errors cannot crash the process', () => {
        const transport = new EventEmitter() as unknown as WebSocket;
        const session = nodeSocketSession(transport, '/echo');
        // A real EventEmitter throws when 'error' is emitted with no listener;
        // the session must absorb protocol violations (maxPayload, bad UTF-8)
        // and let the ws close flow complete the streams.
        expect(() => transport.emit('error', new Error('maxPayload exceeded'))).not.toThrow();
        transport.emit('close', 1006, '');
        expect(session.isClosed).toBe(true);
    });

    test('heartbeat pings every session on the cadence and reaps silent ones with close 1001', () => {
        vi.useFakeTimers();
        let now = 0;
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 50, idleTimeoutMs: 100, now: () => now });
        const transport = fakeTransport();
        sessionAt('/echo', transport);
        expect(vi.getTimerCount()).toBe(1);

        // First sweep probes with a ping; still within idle → spared.
        now = 60;
        vi.advanceTimersByTime(50);
        expect(transport.ping).toHaveBeenCalledTimes(1);
        expect(transport.close).not.toHaveBeenCalled();

        // No pong (or traffic) past idle → reaped with 1001, not terminate().
        now = 160;
        vi.advanceTimersByTime(50);
        expect(transport.ping).toHaveBeenCalledTimes(2);
        expect(transport.close).toHaveBeenCalledTimes(1);
        expect(transport.close).toHaveBeenCalledWith(1001, 'session idle');
        expect(transport.terminate).not.toHaveBeenCalled();

        // A session that pongs after the probe keeps its slot.
        const alive = fakeTransport();
        const session = nodeSocketSession(alive as unknown as WebSocket, '/echo', undefined, registry);
        registry.register(session, '/echo', alive as unknown as WebSocket);
        alive.emit('pong'); // lastSeen = 160
        now = 210;
        vi.advanceTimersByTime(50); // sweep at 210: 210-160 = 50 < idle
        expect(alive.close).not.toHaveBeenCalled();
        expect(alive.ping).toHaveBeenCalled();
    });

    test('heartbeat treats inbound traffic as liveness (any traffic)', () => {
        vi.useFakeTimers();
        let now = 0;
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 50, idleTimeoutMs: 100, now: () => now });
        const transport = fakeTransport();
        sessionAt('/echo', transport);

        now = 90;
        vi.advanceTimersByTime(50); // sweep 1: ping
        transport.emit('message', 'hello'); // lastSeen = 90
        now = 170;
        vi.advanceTimersByTime(50); // sweep 2: 170-90 = 80 < idle → spared
        expect(transport.close).not.toHaveBeenCalled();

        now = 230;
        vi.advanceTimersByTime(50); // sweep 3: 230-90 = 140 >= idle → reaped
        expect(transport.close).toHaveBeenCalledTimes(1);
        expect(transport.close).toHaveBeenCalledWith(1001, 'session idle');
    });

    test('heartbeat stops when the last session leaves, and stop() clears the timer', () => {
        vi.useFakeTimers();
        let now = 0;
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 50, idleTimeoutMs: 100, now: () => now });
        const transport = fakeTransport();
        const session = sessionAt('/echo', transport);
        expect(vi.getTimerCount()).toBe(1);

        // What the adapter's transport-close listener does (unit seam):
        registry.remove(session);
        expect(vi.getTimerCount()).toBe(0);

        const again = fakeTransport();
        sessionAt('/room', again);
        expect(vi.getTimerCount()).toBe(1);
        registry.stop();
        expect(vi.getTimerCount()).toBe(0);
    });

    test('heartbeat can be disabled explicitly', () => {
        vi.useFakeTimers();
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null });
        sessionAt('/echo');
        expect(vi.getTimerCount()).toBe(0);
    });

    test('heartbeatIntervalMs 0 normalizes to disabled (no busy interval)', () => {
        vi.useFakeTimers();
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 0 });
        sessionAt('/echo');
        expect(vi.getTimerCount()).toBe(0);

        // 1 still schedules a sweep.
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 50 });
        sessionAt('/echo2');
        expect(vi.getTimerCount()).toBe(1);
    });

    test('overflow close decision is memoized — no repeat observers or close(1013) per broadcast', () => {
        const onOverflow = vi.fn();
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null, onOverflow });
        sessionAt('/echo');
        transports[0].bufferedAmount = 2_000_000;

        // First broadcast: decision made once.
        registry.broadcast('/echo', 'x');
        expect(onOverflow).toHaveBeenCalledTimes(1);
        expect(transports[0].close).toHaveBeenCalledTimes(1);
        expect(transports[0].close).toHaveBeenCalledWith(1013, 'consumer too slow');

        // Second broadcast while the close handshake is pending: no re-fire.
        registry.broadcast('/echo', 'y');
        expect(onOverflow).toHaveBeenCalledTimes(1);
        expect(transports[0].close).toHaveBeenCalledTimes(1);

        // Once removed (close event), a fresh registration can overflow again.
        transports[0].emit('close', 1013, 'consumer too slow');
        const replacement = fakeTransport();
        sessionAt('/echo', replacement);
        replacement.bufferedAmount = 2_000_000;
        registry.broadcast('/echo', 'z');
        expect(onOverflow).toHaveBeenCalledTimes(2);
    });

    test('backpressure observer list is dynamic (add/remove after construction)', () => {
        const observer = vi.fn();
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null });
        sessionAt('/echo');
        transports[0].bufferedAmount = 2_000_000;

        const unsubscribe = registry.addOverflowObserver(observer);
        registry.broadcast('/echo', 'x');
        expect(observer).toHaveBeenCalledWith({ path: '/echo', action: 'close', bufferedBytes: 2_000_000 });

        unsubscribe();
        registry.broadcast('/echo', 'y');
        expect(observer).toHaveBeenCalledTimes(1);
    });

    test('broadcast serializes the payload once, not once per session (O2)', () => {
        const session = sessionAt('/echo');
        const spy = vi.spyOn(JSON, 'stringify');
        registry.broadcast('/echo', { event: 'tick', n: 1 });
        // One serialization for the broadcast; each session sends the
        // pre-built wire string directly.
        expect(spy).toHaveBeenCalledTimes(1);
        expect(transports[0].send).toHaveBeenCalledWith(JSON.stringify({ event: 'tick', n: 1 }));
        spy.mockRestore();
        void session;
    });

    test('closeAll validates close frames up front and is resilient', () => {
        sessionAt('/echo');
        // Invalid code/reason → RangeError before any session is touched.
        expect(() => registry.closeAll(1337 as 1000)).toThrow(RangeError);
        expect(() => registry.closeAll(1000, 'x'.repeat(124))).toThrow(RangeError);
        // Valid close reaches sessions; a throwing session does not abort.
        transports[0].close.mockImplementationOnce(() => {
            throw new Error('transport gone');
        });
        expect(() => registry.closeAll(1001, 'bye')).not.toThrow();
        expect(transports[0].close).toHaveBeenCalledTimes(1);
    });

    test('session close rejects invalid codes and oversized reasons (O8)', () => {
        const session = sessionAt('/echo');
        expect(() => session.close(1005 as 1000)).toThrow(RangeError);
        expect(() => session.close(3000, 'x'.repeat(124))).toThrow(RangeError);
        // Valid application range passes through.
        session.close(4000, 'done');
        expect(transports[0].close).toHaveBeenCalledWith(4000, 'done');
    });

    describe('overflow observers', () => {
        test('a throwing overflow observer cannot abort the broadcast', () => {
            const onOverflow = vi.fn(() => {
                throw new Error('telemetry down');
            });
            registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: null, onOverflow });
            sessionAt('/echo');
            transports[0].bufferedAmount = 2_000_000;
            // The observer fault must not skip the policy decision (close 1013)
            // or break the surplus of the broadcast.
            expect(() => registry.broadcast('/echo', 'x')).not.toThrow();
            expect(transports[0].close).toHaveBeenCalledWith(1013, 'consumer too slow');
        });
    });

    describe('registration guard', () => {
        test('register skips sessions that already closed', () => {
            const transport = fakeTransport();
            const session = nodeSocketSession(transport as unknown as WebSocket, '/echo', undefined, registry);
            // Peer closed before the adapter finished dispatching (e.g. while
            // an auth hook awaited) — instrumenting the closed session must
            // not pin a stale registry entry.
            transport.emit('close', 1006, 'gone');
            expect(session.isClosed).toBe(true);
            registry.register(session, '/echo', transport as unknown as WebSocket);
            expect(registry.count('/echo')).toBe(0);
        });
    });

    describe('session-level outbound watermark (AD-21 D6 hardening)', () => {
        test('send over the watermark closes 1013 in close mode', () => {
            const transport = fakeTransport();
            transport.bufferedAmount = 2_000_000;
            const session = nodeSocketSession(transport as unknown as WebSocket, '/echo', undefined, null);
            session.send('hello');
            expect(transport.close).toHaveBeenCalledWith(1013, 'consumer too slow');
            expect(transport.send).not.toHaveBeenCalled();
        });

        test('send over the watermark drops the frame in drop mode', () => {
            const transport = fakeTransport();
            transport.bufferedAmount = 2_000_000;
            const session = nodeSocketSession(transport as unknown as WebSocket, '/echo', undefined, null, {
                ...DEFAULT_SOCKET_LIMITS,
                maxBufferedBytes: 1024,
                onOverflow: 'drop',
            });
            session.send('hello');
            expect(transport.close).not.toHaveBeenCalled();
            expect(transport.send).not.toHaveBeenCalled();
        });

        test('under-watermark sends pass through', () => {
            const transport = fakeTransport();
            const session = nodeSocketSession(transport as unknown as WebSocket, '/echo', undefined, null);
            session.send('hello');
            expect(transport.send).toHaveBeenCalledWith('hello');
        });
    });
});
