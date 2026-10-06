/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import type { ServerResponse } from 'node:http';
import { writeRenderResult } from '../src/producer-writer';

/**
 * `ServerResponse`-shaped sink backed by a real `EventEmitter`, so the
 * writer's `once(res, 'drain')` wait can be driven deterministically.
 */
class BackpressureSink extends EventEmitter {
    headersSent = false;
    destroyed = false;
    writeHead = vi.fn();
    flushHeaders = vi.fn();
    write = vi.fn(() => true);
    end = vi.fn();
}

/** Yields to the event loop so a pending generator write can be observed. */
const flush = (): Promise<void> => {
    const { promise, resolve } = Promise.withResolvers<void>();
    setImmediate(resolve);
    return promise;
};

describe('writeRenderResult backpressure', () => {
    test('waits for drain before writing the next streamed chunk', async () => {
        const sink = new BackpressureSink();
        sink.write.mockReturnValueOnce(false);

        async function* body(): AsyncGenerator<string> {
            yield 'first';
            yield 'second';
        }

        const pending = writeRenderResult(sink as unknown as ServerResponse, { headers: {}, body: body() });

        // Let the generator deliver its first chunk; the writer must now be
        // parked on the drain wait rather than pushing the next one.
        await flush();
        expect(sink.write).toHaveBeenCalledTimes(1);
        expect(sink.write).toHaveBeenNthCalledWith(1, 'first');

        let settled = false;
        void pending.then(() => {
            settled = true;
        });
        await flush();
        expect(settled).toBe(false);
        expect(sink.end).not.toHaveBeenCalled();

        sink.emit('drain');
        await pending;

        expect(sink.write).toHaveBeenCalledTimes(2);
        expect(sink.write).toHaveBeenNthCalledWith(2, 'second');
        expect(sink.end).toHaveBeenCalledTimes(1);
    });

    test('stops streaming once the response is destroyed', async () => {
        const sink = new BackpressureSink();

        async function* body(): AsyncGenerator<string> {
            yield 'first';
            sink.destroyed = true;
            yield 'second';
        }

        await writeRenderResult(sink as unknown as ServerResponse, { headers: {}, body: body() });

        expect(sink.write).toHaveBeenCalledTimes(1);
        expect(sink.end).not.toHaveBeenCalled();
    });
});
