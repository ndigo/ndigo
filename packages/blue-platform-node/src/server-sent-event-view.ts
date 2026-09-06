/**
 * Imperative server-push view: streams Server-Sent Events to the HTTP
 * response (AD-9, naming cleanup).
 *
 * The view is constructed **per request** with its own event source — unlike
 * resolved views, it carries per-connection state (the source, the open
 * response). Handlers return it directly; it is never resolved by name (see
 * the view-resolution strategy plan).
 *
 * ```ts
 * @getMapping('/events')
 * events() {
 *     return new ServerSentEventView(tickStream());
 * }
 * ```
 *
 * The source's yielded values become SSE frames. A value shaped
 * `{ event?, data }` contributes an `event:` line (when present) plus a JSON
 * `data:` line; any other value is framed as JSON data only. Frames are
 * terminated by a blank line, so JSON-serialized payloads (which escape
 * newlines) are safe. The response ends when the source ends.
 *
 * No new dependency: the stream rides the existing `node:http` response
 * (WebSocket was deliberately deferred — see AD-9).
 *
 * @module
 * @since 1.0.0
 */

import { MediaTypes, ServerSentEvent } from '@blue/core';
import { Route } from '@blue/router';
import { View } from '@blue/view';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Normalizes a yielded item into the shared event envelope: `{ event, data }`
 * -shaped values pass through, anything else becomes an unnamed data event.
 *
 * @param item - The value yielded by the event source.
 * @returns The normalized envelope.
 */
function normalize(item: unknown): ServerSentEvent {
    if (typeof item === 'object' && item !== null && 'data' in item) {
        return {
            event: typeof (item as ServerSentEvent).event === 'string' ? (item as ServerSentEvent).event : 'message',
            data: (item as ServerSentEvent).data,
        };
    }
    return { event: 'message', data: item };
}

/**
 * A `View` that writes an async-iterable event source to the HTTP response as
 * `text/event-stream`, one SSE frame per yielded value.
 */
export class ServerSentEventView implements View {
    readonly #source: AsyncIterable<unknown>;

    /**
     * Number of frames written to the response. Observable (public) so
     * telemetry instrumentations can report streaming totals without hooks
     * in the hot write path.
     */
    frameCount = 0;

    /**
     * Set when the stream ends because the client disconnected (the write
     * failed or the response was destroyed mid-stream). Observable for
     * telemetry.
     */
    clientDisconnected = false;

    /**
     * Creates a view for the given event source.
     *
     * @param source - The async iterable of events to push.
     */
    constructor(source: AsyncIterable<unknown>) {
        if (typeof source[Symbol.asyncIterator] !== 'function') {
            throw new TypeError('ServerSentEventView requires an async-iterable event source.');
        }
        this.#source = source;
    }

    /**
     * The media type of the streamed response.
     */
    mediaType = MediaTypes.TEXT_EVENT_STREAM;

    /**
     * Indicates if the view has been destroyed.
     */
    destroyed = false;

    /**
     * Destroys the view; renders after destruction become no-ops.
     */
    destroy(): void {
        this.destroyed = true;
    }

    /**
     * Stream the view's event source to the `ServerResponse` stored in the
     * route's attributes. Ends the response when the source completes.
     *
     * @param _model - Unused — the source is owned by the view.
     * @param route - The current route; supplies the `ServerResponse`.
     * @param _target - Unused — this view writes directly to the response.
     */
    async render(_model: unknown, route: Route, _target: unknown): Promise<void> {
        if (this.destroyed) {
            return;
        }

        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) {
            return;
        }
        if (res.destroyed) {
            // The client was already gone before this render started.
            this.clientDisconnected = true;
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
        });
        // Send the response headers NOW: Node buffers headers until the first
        // write, and a waiting stream would otherwise never deliver them —
        // the client waits for the 200 before it (or its own push trigger)
        // proceeds.
        res.flushHeaders();

        // Node surfaces a client abort on the socket close, not on write()
        // (writes to a closed socket may succeed while buffered). Watch the
        // response's close so a mid-stream disconnect is observable.
        const onClose = (): void => {
            this.clientDisconnected = true;
        };
        res.on('close', onClose);

        try {
            for await (const item of this.#source) {
                if (res.destroyed) {
                    this.clientDisconnected = true;
                    break;
                }
                const { event, data } = normalize(item);
                const frame = `${event !== undefined ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
                try {
                    res.write(frame);
                    this.frameCount += 1;
                } catch {
                    // The client disconnected mid-stream; stop pushing.
                    this.clientDisconnected = true;
                    break;
                }
            }
        } finally {
            res.off('close', onClose);
            try {
                res.end();
            } catch {
                // The response is already gone (client disconnect).
            }
        }
    }
}
