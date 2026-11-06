/**
 * Imperative server-push view: streams Server-Sent Events to the HTTP.
 */
import { MediaTypes, ServerSentEvent } from '@ndigo/core';
import { Route } from '@ndigo/router';
import { type ProducerView, type RenderResult } from '@ndigo/view';
import type { ServerResponse } from 'node:http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

const SSE_HEADERS: Record<string, string> = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
};

/**
 * Normalizes a yielded item into the shared event envelope: `{ event, data }`
 * -shaped values pass through, anything else becomes an unnamed data event.
 *
 * @param item - The item yielded by the event source.
 * @returns The normalized envelope.
 */
function normalize(item: unknown): ServerSentEvent {
    if (typeof item === 'object' && item !== null && 'data' in item) {
        return {
            event: 'event' in item && typeof item.event === 'string' ? item.event : 'message',
            data: item.data,
        };
    }
    return { event: 'message', data: item };
}

/**
 * A producing view that streams an async-iterable event source as
 * `text/event-stream`, one SSE frame per yielded value.
 */
export class ServerSentEventView implements ProducerView {
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
     * Destroys the view; renders after destruction produce an empty stream.
     */
    destroy(): void {
        this.destroyed = true;
    }

    /** @inheritdoc */
    async renderTo(_model: unknown, route: Route): Promise<RenderResult> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;

        if (this.destroyed || !res) {
            return { status: 200, headers: SSE_HEADERS, body: (async function* () {})() };
        }

        const source = this.#source;
        const aborted = () => res.destroyed;
        const onDisconnect = () => {
            this.clientDisconnected = true;
        };
        const onFrame = () => {
            this.frameCount += 1;
        };
        const onClose = (): void => {
            this.clientDisconnected = true;
        };
        res.on('close', onClose);

        return {
            status: 200,
            headers: SSE_HEADERS,
            body: (async function* () {
                try {
                    for await (const item of source) {
                        if (aborted()) {
                            onDisconnect();
                            return;
                        }
                        const { event, data } = normalize(item);
                        yield `${event !== undefined ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
                        onFrame();
                    }
                } finally {
                    res.off('close', onClose);
                }
            })(),
        };
    }
}
