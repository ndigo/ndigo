/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { nodeSocketSession, NodeSocketSessionRegistry } from '../src/index';
import type { WebSocket } from 'ws';
import type { SocketSession } from '@blue/dispatcher';

/**
 * Minimal `ws`-shaped transport double: event emitter + send/close/terminate
 * spies. Sessions built on top of it exercise the real contract surface.
 */
function fakeTransport() {
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
    return {
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

    test('heartbeat reaps sessions silent past idleTimeoutMs and spares ponging ones', () => {
        vi.useFakeTimers();
        let now = 0;
        registry = new NodeSocketSessionRegistry({ heartbeatIntervalMs: 50, idleTimeoutMs: 100, now: () => now });
        const transport = fakeTransport();
        sessionAt('/echo', transport);
        expect(vi.getTimerCount()).toBe(1);

        // No pong: past idle → terminated.
        now = 101;
        vi.advanceTimersByTime(50);
        expect(transport.terminate).toHaveBeenCalledTimes(1);

        // A ponging session is spared: pong at t=101, sweep at t=160 → 59ms
        // since last traffic.
        const alive = fakeTransport();
        const session = nodeSocketSession(alive as unknown as WebSocket, '/echo', undefined, registry);
        registry.register(session, '/echo', alive as unknown as WebSocket);
        alive.emit('pong');
        now = 160;
        vi.advanceTimersByTime(50);
        expect(alive.terminate).not.toHaveBeenCalled();
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
});