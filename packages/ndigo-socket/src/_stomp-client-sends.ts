/**
 * Outbound send and receipt tracking for the STOMP client.
 */
import { RingBuffer } from '@ndigo/core';
import { STOMPProtocolError } from './stomp-frame.js';
import type { STOMPFrame } from './stomp-frame.js';
import type { PendingReceipt } from './_stomp-client-internal.js';

/** The client state the send tracker reads and the wire it writes through. */
export interface STOMPSendHost {
    /** Whether the STOMP session is connected (CONNECTED received). */
    readonly connected: boolean;
    /** Whether the session ended (disconnect, ERROR, transport closed). */
    readonly done: boolean;
    /** Serialize and send one frame through the socket. */
    sendFrame(frame: STOMPFrame): void;
}

/**
 * Owns receipt correlation and the bounded buffer of sends made while
 * connecting.
 */
export class STOMPSendTracker {
    readonly #receipts = new Map<string, PendingReceipt>();
    readonly #pending: RingBuffer<{ receiptId: string; send: () => void }>;
    readonly #maxPending: number;
    #nextReceiptId = 0;

    /**
     * @param maxPendingSends - Bound on sends buffered while (re)connecting.
     */
    constructor(maxPendingSends: number) {
        this.#maxPending = maxPendingSends;
        // Ring capacity rounds the bound up to a power of 2; the exact
        // bound is enforced by the length guard in `send`.
        this.#pending = new RingBuffer<{ receiptId: string; send: () => void }>(maxPendingSends);
    }

    /**
     * Sends a message, resolving on RECEIPT.
     *
     * @param host - The session state and wire.
     * @param destination - The destination.
     * @param body - The message body.
     * @param headers - Extra headers.
     * @returns A promise resolving on RECEIPT.
     */
    send(host: STOMPSendHost, destination: string, body: unknown, headers: Record<string, string>): Promise<void> {
        if (host.done) {
            // A buffered frame can never be flushed or receipted — reject
            // now instead of pinning the caller's promise forever.
            const { promise, reject } = Promise.withResolvers<void>();
            reject(new STOMPProtocolError('client is closed'));
            return promise;
        }
        const payload: string | Uint8Array =
            typeof body === 'string'
                ? body
                : body instanceof Uint8Array
                  ? body
                  : body instanceof ArrayBuffer
                    ? new Uint8Array(body)
                    : JSON.stringify(body);
        const ownHeaders = { ...headers };
        // Namespace auto receipt ids so a caller-supplied `receipt` header
        // can never collide with a generated one (a collision would
        // overwrite the map entry and strand the first send's promise).
        const receiptId = ownHeaders['receipt'] ?? `ndigo-${this.#nextReceiptId++}-${crypto.randomUUID()}`;
        ownHeaders['receipt'] = receiptId;
        if (this.#receipts.has(receiptId)) {
            // The id already awaits its own RECEIPT: reject the newcomer
            // instead of overwriting the map entry.
            const { promise, reject } = Promise.withResolvers<void>();
            reject(new STOMPProtocolError('duplicate receipt id'));
            return promise;
        }
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        const receipt: PendingReceipt = { resolve, reject, sent: false };
        this.#receipts.set(receiptId, receipt);
        const send = (): void => {
            // Exception-safe: a serialization fault must not escape `send()`
            // — it would strand this receipt entry and, on the flush path,
            // abort the whole queue. The frame never left the wire, so
            // settle this send alone and leave `sent` false.
            try {
                host.sendFrame({ command: 'SEND', headers: { destination, ...ownHeaders }, body: payload });
            } catch (error) {
                this.#receipts.delete(receiptId);
                reject(error instanceof Error ? error : new STOMPProtocolError(String(error)));
                return;
            }
            receipt.sent = true;
        };
        if (host.connected) {
            send();
        } else if (this.#maxPending === 0) {
            // Buffering disabled — reject immediately; nothing is queued.
            this.#receipts.delete(receiptId);
            reject(new STOMPProtocolError('client is not connected'));
        } else {
            this.#pending.put({ receiptId, send });
            if (this.#pending.length > this.#maxPending) {
                // Bounded buffer (drop-oldest): the evicted send's receipt
                // promise settles so no app await hangs on it.
                const evicted = this.#pending.get();
                if (evicted !== undefined) {
                    const pending = this.#receipts.get(evicted.receiptId);
                    if (pending !== undefined) {
                        this.#receipts.delete(evicted.receiptId);
                        pending.reject(new STOMPProtocolError('send buffer overflow'));
                    }
                }
            }
        }
        return promise;
    }

    /**
     * Resolves the receipt promise for a RECEIPT frame, when it is pending.
     *
     * @param receiptId - The receipt id.
     */
    resolve(receiptId: string): void {
        const pending = this.#receipts.get(receiptId);
        if (pending !== undefined) {
            this.#receipts.delete(receiptId);
            pending.resolve();
        }
    }

    /**
     * Rejects every outstanding receipt promise — a terminal path where no
     * frame can ever be receipted.
     *
     * @param error - The reason.
     */
    settleAll(error: Error): void {
        for (const pending of this.#receipts.values()) {
            pending.reject(error);
        }
        this.#receipts.clear();
    }

    /**
     * Rejects the receipts of sends whose frame already left the transport:
     * the dropped STOMP session can never receipt them. Buffered frames keep
     * their promises for the new session.
     */
    settleSent(): void {
        for (const [receiptId, pending] of this.#receipts) {
            if (!pending.sent) {
                continue;
            }
            this.#receipts.delete(receiptId);
            pending.reject(new STOMPProtocolError('connection closed'));
        }
    }

    /**
     * Flushes sends buffered while (re)connecting. Per-item fault isolation:
     * one failing send never aborts the rest of the queue.
     */
    flushPending(): void {
        while (this.#pending.length > 0) {
            const pending = this.#pending.get() as { receiptId: string; send: () => void };
            try {
                pending.send();
            } catch (error) {
                const receipt = this.#receipts.get(pending.receiptId);
                if (receipt !== undefined) {
                    this.#receipts.delete(pending.receiptId);
                    receipt.reject(error instanceof Error ? error : new STOMPProtocolError(String(error)));
                }
            }
        }
    }

    /**
     * Drops every buffered send (their frames were never flushed). Their
     * receipt promises were already settled by the caller.
     */
    drainPending(): void {
        while (this.#pending.length > 0) {
            this.#pending.get();
        }
    }
}
