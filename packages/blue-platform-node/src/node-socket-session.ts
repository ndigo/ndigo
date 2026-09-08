/**
 * Node WebSocket session — wraps a `ws` (RFC 6455) connection as a
 * {@link SocketSession}.
 *
 * Inbound frames surface through `messages` as an async iterable; `send`
 * writes text/JSON frames; close code/reason propagate to `closed` and
 * `isClosed`. The `ws` connection is an event emitter, so this adapter
 * bridges its events to the async-iterable contract the dispatcher defines.
 * Request sources (query/headers/cookies from the upgrade) are exposed so
 * handlers can read and validate them like HTTP arguments.
 *
 * @module
 * @since 1.0.0
 */

import type { SocketSession, SocketRequestSources } from '@blue/dispatcher';
import type { WebSocket } from 'ws';

/**
 * Creates a {@link SocketSession} on top of a `ws` WebSocket connection.
 *
 * @param transport - The underlying `ws` WebSocket (or transport-compatible
 *   double in tests).
 * @param path - The request path (for `session.path`).
 * @param sources - Request sources captured from the upgrade request.
 * @returns The session.
 */
export function nodeSocketSession(
    transport: WebSocket,
    path: string,
    sources: SocketRequestSources = { query: {}, headers: {}, cookies: {} },
    params: Record<string, unknown> = {}
): SocketSession {
    const inbound = new AsyncReader<unknown>();
    const closed = new AsyncReader<number>();
    let isClosed = false;

    const onMessage = (data: unknown): void => {
        // ws delivers text frames as strings and binary frames as Buffers.
        // Surface both as their string form so handlers see predictable text
        // (echo/chat patterns); binary stays accessible via the Buffer form.
        inbound.push(Buffer.isBuffer(data) ? data.toString('utf-8') : data);
    };
    const onClose = (code: number, reason: string): void => {
        isClosed = true;
        inbound.complete();
        closed.push(code);
        closed.complete();
    };
    transport.on('message', onMessage);
    transport.on('close', onClose);

    return {
        get path() {
            return path;
        },
        get params() {
            // Values bound from `@parameters` extractors resolved against the
            // upgrade request sources (validated/coerced by extractor + Zod).
            return params;
        },
        get query() {
            return sources.query;
        },
        get headers() {
            return sources.headers;
        },
        get cookies() {
            return sources.cookies;
        },
        get messages() {
            return inbound.iterable();
        },
        get closed() {
            return closed.iterable();
        },
        get isClosed() {
            return isClosed;
        },
        send(data: unknown) {
            if (typeof data === 'string') {
                transport.send(data);
            } else {
                transport.send(JSON.stringify(data));
            }
        },
        close(code?: number, reason?: string) {
            transport.close(code ?? 1000, reason ?? '');
        },
    };
}

/**
 * A minimal async iterable built from push + complete events.
 *
 * Bridges the event-driven transport to `for await` consumers without
 * buffering the whole stream: pushed values are queued; consumers await the
 * next slot. `complete()` (transport close) ends the stream after the
 * remaining queue has drained.
 */
class AsyncReader<T> {
    #queue: T[] = [];
    #waiter: Array<() => void> = [];
    #completed = false;

    push(value: T): void {
        this.#queue.push(value);
        const waiter = this.#waiter.shift();
        if (waiter) waiter();
    }

    complete(): void {
        this.#completed = true;
        const waiters = this.#waiter.splice(0);
        for (const waiter of waiters) waiter();
    }

    async *iterable(): AsyncGenerator<T> {
        while (true) {
            while (this.#queue.length > 0) {
                yield this.#queue.shift() as T;
            }
            if (this.#completed) return;
            // eslint-disable-next-line no-await-in-loop -- consumer-pull iterator: each iteration awaits a fresh "next value available" signal; parallelizing is impossible (single stream, ordering required).
            await new Promise<void>((resolve) => this.#waiter.push(resolve));
        }
    }
}