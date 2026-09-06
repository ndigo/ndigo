/**
 * View that streams a model as Server-Sent Events to the HTTP response (AD-9).
 *
 * The model must carry an async-iterable event source under the `events` key:
 *
 * ```ts
 * @getMapping('/events')
 * events() {
 *     return new ModelAndView(new EventStreamView(), { events: tickStream() });
 * }
 * ```
 *
 * Each yielded value is written as one SSE frame. A value shaped
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

import { MediaTypes } from '@blue/core';
import { Route } from '@blue/router';
import { View } from '@blue/view';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * One server-pushed event: an optional event name plus a payload to
 * JSON-serialize into the frame's `data:` line.
 */
export interface StreamEvent {
    /** Optional event name written to the `event:` line. */
    event?: string;
    /** Payload JSON-serialized into the `data:` line. */
    data: unknown;
}

/** An event source as carried by the view model (`{ events: source }`). */
export type EventSource = AsyncIterable<unknown>;

/**
 * Normalizes a yielded item into an event envelope: `{ event, data }`-shaped
 * values pass through, anything else becomes an unnamed data event.
 *
 * @param item - The value yielded by the event source.
 * @returns The normalized envelope.
 */
function normalize(item: unknown): StreamEvent {
    if (typeof item === 'object' && item !== null && 'data' in item) {
        return { event: (item as StreamEvent).event, data: (item as StreamEvent).data };
    }
    return { data: item };
}

/**
 * A `View` that writes an async-iterable model to the HTTP response as
 * `text/event-stream`, one SSE frame per yielded value.
 */
export class EventStreamView implements View {
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
     * Stream the model's event source to the `ServerResponse` stored in the
     * route's attributes. Ends the response when the source completes.
     *
     * @param model - The view model; `model.events` must be an async iterable.
     * @param route - The current route; supplies the `ServerResponse`.
     * @param _target - Unused — this view writes directly to the response.
     */
    async render(model: unknown, route: Route, _target: unknown): Promise<void> {
        if (this.destroyed) {
            return;
        }

        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent || res.destroyed) {
            return;
        }

        const source = (model as { events?: unknown } | null)?.events;
        if (
            typeof source !== 'object' ||
            source === null ||
            typeof (source as EventSource)[Symbol.asyncIterator] !== 'function'
        ) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'EventStreamView requires model.events to be an async iterable' }));
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

        try {
            for await (const item of source as EventSource) {
                if (res.destroyed) {
                    break;
                }
                const { event, data } = normalize(item);
                const frame = `${event !== undefined ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
                try {
                    res.write(frame);
                } catch {
                    // The client disconnected mid-stream; stop pushing.
                    break;
                }
            }
        } finally {
            try {
                res.end();
            } catch {
                // The response is already gone (client disconnect).
            }
        }
    }
}
