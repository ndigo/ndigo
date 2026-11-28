/**
 * Outbound buffering for the WebSocket client: bounded queue, wire-race
 * retry parking, and send-size observation.
 */
import { RingBuffer } from '@ndigo/core';
import { TEXT_ENCODER } from './_socket-client-transport.js';
import type { SocketTransport } from './socket-client-types.js';

/**
 * Buffers outbound frames while the client is disconnected and flushes them
 * in order on reconnect.
 *
 * The ring cannot push-front, so a frame whose send raced the wire to
 * CLOSING parks in `#retryPending` and is retried first on the next open.
 */
export class SocketOutboundQueue {
    readonly #ring: RingBuffer<string | ArrayBuffer>;
    readonly #limit: number | null;
    readonly #onSend: ((bytes: number) => void) | null;
    #retryPending: string | ArrayBuffer | null = null;

    /**
     * @param limit - Maximum queued messages; `null` disables buffering.
     * @param onSend - Byte-size observer, or `null`.
     */
    constructor(limit: number | null, onSend: ((bytes: number) => void) | null) {
        this.#limit = limit;
        this.#onSend = onSend;
        // The ring's power-of-2 capacity rounds the bound up; the exact
        // `maxMessages` is enforced by the length guard in `push`.
        this.#ring = new RingBuffer<string | ArrayBuffer>(limit ?? 16);
    }

    /** Whether the client reports exact wire sizes through `onSend`. */
    get onSendWired(): boolean {
        return this.#onSend !== null;
    }

    /**
     * Appends a frame, dropping the oldest when the configured bound is
     * exceeded. No-op when buffering is disabled.
     *
     * @param payload - The frame to buffer.
     */
    push(payload: string | ArrayBuffer): void {
        if (this.#limit === null) {
            return;
        }
        this.#ring.put(payload);
        if (this.#ring.length > this.#limit) {
            this.#ring.get();
        }
    }

    /** Drops every buffered frame and the parked retry. */
    clear(): void {
        while (this.#ring.length > 0) {
            this.#ring.get();
        }
        this.#retryPending = null;
    }

    /**
     * Reports one written payload's byte size to the `onSend` observer.
     * Isolated: an observer fault must never wedge the send path.
     *
     * @param payload - The payload that just hit the wire.
     */
    notify(payload: string | ArrayBuffer): void {
        const observer = this.#onSend;
        if (observer === null) {
            return;
        }
        try {
            observer(typeof payload === 'string' ? TEXT_ENCODER.encode(payload).length : payload.byteLength);
        } catch {
            // Observer fault — the frame is already on the wire.
        }
    }

    /**
     * Drains the parked retry and buffered frames while the transport is
     * open. A send that races the close handshake parks the frame for the
     * next open, preserving order.
     *
     * @param transport - The live transport.
     * @param isOpen - Whether the client is still `open` (re-checked per frame).
     */
    flush(transport: SocketTransport, isOpen: () => boolean): void {
        while (isOpen()) {
            const retry = this.#retryPending;
            if (retry !== null) {
                try {
                    transport.send(retry);
                } catch {
                    return; // still racing — parked for the next open
                }
                this.notify(retry);
                this.#retryPending = null;
            }
            if (this.#ring.length === 0) {
                return;
            }
            const message = this.#ring.get() as string | ArrayBuffer;
            try {
                transport.send(message);
            } catch {
                this.#retryPending = message;
                return;
            }
            this.notify(message);
        }
    }
}
