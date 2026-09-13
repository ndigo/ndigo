/**
 * @blue/platform-node — response-document writer.
 *
 * @module
 * @since 1.0.0
 */

import type { ServerResponse } from 'node:http';
import { RenderResult } from '@blue/view';

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
    for await (const chunk of body) {
        if (res.destroyed) {
            return;
        }
        try {
            res.write(typeof chunk === 'string' ? chunk : Buffer.from(chunk as Uint8Array));
        } catch {
            // The client disconnected mid-stream; stop pushing.
            return;
        }
    }
    res.end();
}
