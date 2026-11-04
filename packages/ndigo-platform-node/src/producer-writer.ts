/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ServerResponse } from 'node:http';
import { once } from 'node:events';
import { RenderResult } from '@ndigo/view';

/**
 * Waits for a saturated response to become writable again, or to close
 * (PLN-F3). A backpressured client that aborts emits `close` — never `drain`
 * — so awaiting `drain` alone would park the writer forever and leak the
 * suspended producer.
 *
 * @param res - The response awaiting backpressure relief.
 * @returns `true` when the response drained, `false` when it closed (or
 *   errored) first.
 */
function waitForDrainOrClose(res: ServerResponse): Promise<boolean> {
    return Promise.race([
        once(res, 'drain').then(
            () => true,
            () => false
        ),
        once(res, 'close').then(
            () => false,
            () => false
        ),
    ]);
}

/**
 * Writes a {@link RenderResult} to an HTTP response.
 *
 * @param res - The response to write to; a no-op when absent or already sent.
 * @param result - The response document.
 */
export async function writeRenderResult(res: ServerResponse | undefined, result: RenderResult): Promise<void> {
    if (!res || res.headersSent) {
        return;
    }

    const headers: Record<string, string> = { ...result.headers };
    if (headers['Content-Type'] === undefined && result.mediaType) {
        headers['Content-Type'] = result.mediaType.toString();
    }
    res.writeHead(result.status ?? 200, headers);
    // Deliver headers now — a streaming body (e.g. SSE) must not hold the
    // response open waiting for its first frame. Guarded: mock responses may
    // not implement the flush.
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }

    const { body } = result;
    if (typeof body === 'string') {
        res.end(body);
        return;
    }
    if (body instanceof Uint8Array) {
        res.end(Buffer.from(body));
        return;
    }
    const iterator = body[Symbol.asyncIterator]();
    try {
        for (;;) {
            // eslint-disable-next-line no-await-in-loop -- frames are produced and written strictly in order
            const { done, value } = await iterator.next();
            if (done) {
                break;
            }
            if (res.destroyed) {
                return;
            }
            try {
                if (!res.write(typeof value === 'string' ? value : Buffer.from(value as Uint8Array))) {
                    // The consumer is saturated — wait for it to drain, or for
                    // the client to go away (PLN-F3), before pushing more.
                    // eslint-disable-next-line no-await-in-loop -- backpressure relief is per-write
                    const drained = await waitForDrainOrClose(res);
                    if (!drained || res.destroyed) {
                        return;
                    }
                }
            } catch {
                // The client disconnected mid-stream; stop pushing.
                return;
            }
        }
        res.end();
    } finally {
        // Close the producer on every exit path (abort included) so its
        // `finally` blocks run instead of leaking a suspended generator.
        if (typeof iterator.return === 'function') {
            await iterator.return();
        }
    }
}
