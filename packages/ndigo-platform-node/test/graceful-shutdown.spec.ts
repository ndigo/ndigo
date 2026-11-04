/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ApplicationContext } from '@ndigo/context';
import { gracefulShutdown, type Closable } from '../src/graceful-shutdown';

/** A context stand-in whose `close()` is a spy. */
const mockContext = (): ApplicationContext => ({ close: vi.fn() }) as unknown as ApplicationContext;

/** A resource whose `close()` never settles — simulates a hung drain. */
const hangingResource = (): Closable => ({ close: () => new Promise<void>(() => {}) });

describe('gracefulShutdown', () => {
    /** Resolvers for the next `process.exit` call, in order. */
    let exitResolvers: Array<(code: number) => void>;
    let stop: (() => void) | undefined;

    /** Resolves with the exit code of the next `process.exit` call. */
    const waitForExit = (): Promise<number> =>
        new Promise<number>((resolve) => {
            exitResolvers.push(resolve);
        });

    beforeEach(() => {
        vi.useFakeTimers();
        exitResolvers = [];
        // Never actually terminate the test runner; hand the code to a waiter.
        vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            const c = code ?? 0;
            exitResolvers.shift()?.(c);
        }) as never);
    });

    afterEach(() => {
        stop?.();
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('closes resources in order, then the context, then exits 0', async () => {
        const context = mockContext();
        const order: string[] = [];
        const a: Closable = {
            close: () => {
                order.push('a');
            },
        };
        const b: Closable = {
            close: async () => {
                order.push('b');
            },
        };

        stop = gracefulShutdown(context, { resources: [a, b], timeoutMs: 1000 });
        const code = waitForExit();

        process.emit('SIGINT');

        expect(await code).toBe(0);
        expect(order).toEqual(['a', 'b']);
        expect(context.close).toHaveBeenCalledTimes(1);
    });

    test('wires SIGINT and SIGTERM by default and unregisters on stop', () => {
        const context = mockContext();
        const beforeInt = process.listenerCount('SIGINT');
        const beforeTerm = process.listenerCount('SIGTERM');

        stop = gracefulShutdown(context);

        expect(process.listenerCount('SIGINT')).toBe(beforeInt + 1);
        expect(process.listenerCount('SIGTERM')).toBe(beforeTerm + 1);

        stop();
        stop = undefined;

        expect(process.listenerCount('SIGINT')).toBe(beforeInt);
        expect(process.listenerCount('SIGTERM')).toBe(beforeTerm);
    });

    test('a second signal force-exits with the abort code', async () => {
        const context = mockContext();
        stop = gracefulShutdown(context, { resources: [hangingResource()], timeoutMs: 60_000 });
        const code = waitForExit();

        process.emit('SIGINT'); // begins teardown, hangs on the resource
        process.emit('SIGINT'); // user escalates

        expect(await code).toBe(1);
        expect(context.close).not.toHaveBeenCalled();
    });

    test('a stalled teardown hits the deadline and aborts', async () => {
        const context = mockContext();
        stop = gracefulShutdown(context, { resources: [hangingResource()], timeoutMs: 100 });
        const code = waitForExit();

        process.emit('SIGTERM');
        vi.advanceTimersByTime(100);

        expect(await code).toBe(1);
        expect(context.close).not.toHaveBeenCalled();
    });

    test('a resource that throws aborts before the context closes', async () => {
        const context = mockContext();
        const failing: Closable = { close: () => Promise.reject(new Error('boom')) };

        stop = gracefulShutdown(context, { resources: [failing], timeoutMs: 100 });
        const code = waitForExit();

        process.emit('SIGTERM');

        expect(await code).toBe(1);
        expect(context.close).not.toHaveBeenCalled();
    });

    test('honours custom signals and exit codes', async () => {
        const context = mockContext();
        const before = process.listenerCount('SIGUSR1');

        stop = gracefulShutdown(context, {
            signals: ['SIGUSR1'],
            exitCode: 42,
            timeoutMs: 1000,
        });
        const code = waitForExit();

        expect(process.listenerCount('SIGUSR1')).toBe(before + 1);

        process.emit('SIGUSR1');

        expect(await code).toBe(42);
        expect(context.close).toHaveBeenCalledTimes(1);
    });
});
